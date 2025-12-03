from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import json
import base64
import sys
import logging

# Configure logging to see output immediately
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from config import settings
from services.deepgram_service import DeepgramService
from services.groq_service import GroqService
from services.elevenlabs_service import ElevenLabsService
from services.session_manager import SessionManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    print("=" * 50)
    print("Starting MediVoice Backend...")
    print(f"Frontend URL: {settings.frontend_url}")
    print("=" * 50)
    yield
    print("Shutting down MediVoice Backend...")


app = FastAPI(
    title="MediVoice API",
    description="Real-time voice AI medical assistant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
deepgram_service = DeepgramService()
groq_service = GroqService()
elevenlabs_service = ElevenLabsService()
session_manager = SessionManager()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MediVoice API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for voice conversation"""
    await websocket.accept()
    session_id = session_manager.create_session()
    deepgram_connection = None

    logger.info(f"WebSocket connected: {session_id}")

    try:
        # Variables to track state
        current_transcript = ""
        is_processing = False
        processing_lock = asyncio.Lock()

        logger.info(f"[{session_id}] Setting up callbacks...")

        # Callback for Deepgram transcripts
        def on_transcript(text: str, is_final: bool):
            nonlocal current_transcript
            logger.info(f"[{session_id}] Transcript: {text[:50]}... (final={is_final})")
            asyncio.create_task(send_transcript(text, is_final))

        async def send_transcript(text: str, is_final: bool):
            nonlocal current_transcript, is_processing
            try:
                # Send transcript to frontend
                await websocket.send_json({
                    "type": "transcript",
                    "text": text,
                    "is_final": is_final
                })

                # If final transcript and not already processing, generate response
                # Use lock to prevent race condition with multiple final transcripts
                async with processing_lock:
                    if is_final and text.strip() and not is_processing:
                        is_processing = True
                    else:
                        # Already processing or not final - skip
                        if is_final and text.strip():
                            logger.info(f"[{session_id}] Skipping duplicate transcript: {text[:30]}...")
                        return

                current_transcript = text

                # Add user message to session
                session_manager.add_message(session_id, "user", text)

                # Send thinking status
                await websocket.send_json({
                    "type": "status",
                    "status": "thinking"
                })

                # Get AI response
                conversation = session_manager.get_conversation(session_id)
                response = groq_service.get_response(conversation)

                # Add assistant message to session
                session_manager.add_message(session_id, "assistant", response)

                # Send response text
                await websocket.send_json({
                    "type": "response",
                    "text": response
                })

                # Send speaking status
                await websocket.send_json({
                    "type": "status",
                    "status": "speaking"
                })

                # Generate and send TTS audio
                audio_data = elevenlabs_service.generate_speech(response)
                if audio_data:
                    # Send audio as base64
                    audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                    await websocket.send_json({
                        "type": "audio",
                        "data": audio_base64,
                        "format": "mp3"
                    })

                # Send listening status
                await websocket.send_json({
                    "type": "status",
                    "status": "listening"
                })

                is_processing = False

            except Exception as e:
                logger.error(f"Error in send_transcript: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                is_processing = False

        # Create Deepgram connection
        logger.info(f"[{session_id}] Creating Deepgram connection...")
        try:
            deepgram_connection = await deepgram_service.create_live_connection(
                on_transcript=on_transcript
            )
            logger.info(f"[{session_id}] Deepgram connection created successfully")
        except Exception as e:
            logger.error(f"[{session_id}] Deepgram connection failed: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise

        # Send initial greeting
        logger.info(f"[{session_id}] Generating greeting...")
        await websocket.send_json({
            "type": "status",
            "status": "speaking"
        })

        greeting_audio = elevenlabs_service.generate_greeting()
        logger.info(f"[{session_id}] Greeting audio generated: {len(greeting_audio) if greeting_audio else 0} bytes")
        if greeting_audio:
            audio_base64 = base64.b64encode(greeting_audio).decode('utf-8')
            await websocket.send_json({
                "type": "audio",
                "data": audio_base64,
                "format": "mp3"
            })
            logger.info(f"[{session_id}] Greeting audio sent")

        # Add greeting to conversation history
        session_manager.add_message(
            session_id,
            "assistant",
            "Hello! I'm your medical assistant. How can I help you today?"
        )

        await websocket.send_json({
            "type": "status",
            "status": "listening"
        })

        # Main loop: receive messages from frontend
        logger.info(f"[{session_id}] Entering main loop, waiting for messages...")
        while True:
            message = await websocket.receive()

            if "bytes" in message:
                # Raw audio data from frontend
                audio_data = message["bytes"]
                logger.info(f"[{session_id}] Received binary audio: {len(audio_data)} bytes")
                if deepgram_connection and len(audio_data) > 0:
                    await deepgram_connection.send(audio_data)
                    logger.info(f"[{session_id}] Sent to Deepgram")

            elif "text" in message:
                data = json.loads(message["text"])
                msg_type = data.get("type")

                if msg_type == "audio":
                    # Audio data as base64
                    audio_base64 = data.get("data", "")
                    if audio_base64:
                        audio_data = base64.b64decode(audio_base64)
                        if deepgram_connection and len(audio_data) > 0:
                            await deepgram_connection.send(audio_data)

                elif msg_type == "end_session":
                    # Generate medical summary
                    await websocket.send_json({
                        "type": "status",
                        "status": "thinking"
                    })

                    conversation = session_manager.get_conversation(session_id)
                    summary = groq_service.generate_summary(conversation)

                    # Send goodbye audio
                    goodbye_audio = elevenlabs_service.generate_goodbye()
                    if goodbye_audio:
                        audio_base64 = base64.b64encode(goodbye_audio).decode('utf-8')
                        await websocket.send_json({
                            "type": "audio",
                            "data": audio_base64,
                            "format": "mp3"
                        })

                    # Send summary
                    await websocket.send_json({
                        "type": "summary",
                        "data": summary
                    })

                    await websocket.send_json({
                        "type": "status",
                        "status": "idle"
                    })

                    break

                elif msg_type == "keep_alive":
                    # Keep alive is handled automatically by the SDK
                    pass

    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        import traceback
        print(f"WebSocket error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    finally:
        # Cleanup
        if deepgram_connection:
            await deepgram_connection.close()
        session_manager.end_session(session_id)
        print(f"Session ended: {session_id}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.backend_port)
