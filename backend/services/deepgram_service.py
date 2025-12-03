from deepgram import AsyncDeepgramClient
from deepgram.core.events import EventType
from deepgram.extensions.types.sockets import ListenV1ResultsEvent, ListenV1ControlMessage
from config import settings
import asyncio
from typing import Callable, Optional


class DeepgramService:
    """Service for Speech-to-Text using Deepgram API (SDK v5)"""

    def __init__(self):
        self.client = AsyncDeepgramClient(api_key=settings.deepgram_api_key)

    async def create_live_connection(
        self,
        on_transcript: Callable[[str, bool], None],
        on_error: Optional[Callable[[Exception], None]] = None
    ):
        """
        Create a live transcription connection

        Args:
            on_transcript: Callback(text, is_final) called when transcript received
            on_error: Optional callback for errors
        """
        connection_wrapper = DeepgramConnection(
            self.client,
            on_transcript=on_transcript,
            on_error=on_error
        )
        await connection_wrapper.start()
        return connection_wrapper


class DeepgramConnection:
    """Wrapper for active Deepgram connection (SDK v5)"""

    def __init__(
        self,
        client: AsyncDeepgramClient,
        on_transcript: Callable[[str, bool], None],
        on_error: Optional[Callable[[Exception], None]] = None
    ):
        self.client = client
        self.on_transcript = on_transcript
        self.on_error = on_error
        self.connection = None
        self.is_open = False
        self._listen_task = None
        self._keepalive_task = None
        self._context_manager = None

    async def start(self):
        """Start the Deepgram streaming connection"""
        try:
            print("[DeepgramConnection] Creating connection context manager...")
            # Create the connection context manager
            self._context_manager = self.client.listen.v1.connect(
                model=settings.deepgram_model,
                language=settings.deepgram_language,
                encoding="linear16",
                sample_rate="16000",
                channels="1",
                punctuate="true",
                interim_results="true",
                smart_format="true",
            )
            print(f"[DeepgramConnection] Context manager created: {self._context_manager}")

            # Enter the context manager to get the connection
            print("[DeepgramConnection] Entering context manager...")
            self.connection = await self._context_manager.__aenter__()
            print(f"[DeepgramConnection] Connection established: {self.connection}")
            self.is_open = True

            # Set up event handlers
            print("[DeepgramConnection] Setting up event handlers...")
            self.connection.on(EventType.MESSAGE, self._handle_message)
            self.connection.on(EventType.ERROR, self._handle_error)
            self.connection.on(EventType.CLOSE, self._handle_close)

            # Start listening in a background task
            print("[DeepgramConnection] Starting listen task...")
            self._listen_task = asyncio.create_task(self._listen())

            # Start keepalive task to prevent timeout during TTS playback
            print("[DeepgramConnection] Starting keepalive task...")
            self._keepalive_task = asyncio.create_task(self._send_keepalive())

            print("[DeepgramConnection] Connection started successfully")

        except Exception as e:
            print(f"[DeepgramConnection] Error: {e}")
            import traceback
            print(f"[DeepgramConnection] Traceback: {traceback.format_exc()}")
            raise

    async def _listen(self):
        """Background task to listen for messages"""
        try:
            await self.connection.start_listening()
        except Exception as e:
            print(f"Deepgram listening error: {e}")
            if self.on_error:
                self.on_error(e)

    async def _send_keepalive(self):
        """Send keepalive messages to prevent Deepgram timeout during TTS playback"""
        try:
            while self.is_open:
                await asyncio.sleep(5)  # Send keepalive every 5 seconds
                if self.is_open and self.connection:
                    try:
                        # Send KeepAlive control message using the SDK
                        keepalive_msg = ListenV1ControlMessage(type="KeepAlive")
                        await self.connection.send_control(keepalive_msg)
                        print("[DeepgramConnection] Keepalive sent")
                    except Exception as e:
                        print(f"[DeepgramConnection] Keepalive error: {e}")
        except asyncio.CancelledError:
            print("[DeepgramConnection] Keepalive task cancelled")
        except Exception as e:
            print(f"[DeepgramConnection] Keepalive task error: {e}")

    def _handle_message(self, message):
        """Handle incoming messages from Deepgram"""
        try:
            if isinstance(message, ListenV1ResultsEvent):
                if message.channel and message.channel.alternatives:
                    transcript = message.channel.alternatives[0].transcript
                    is_final = message.is_final or False
                    if transcript:
                        self.on_transcript(transcript, is_final)
        except Exception as e:
            print(f"Transcript handling error: {e}")

    def _handle_error(self, error):
        """Handle errors from Deepgram"""
        print(f"Deepgram error: {error}")
        if self.on_error:
            self.on_error(error)

    def _handle_close(self, _):
        """Handle connection close"""
        print("Deepgram connection closed")
        self.is_open = False

    async def send(self, audio_data: bytes):
        """Send audio data to Deepgram"""
        if self.is_open and self.connection and audio_data and len(audio_data) > 0:
            try:
                await self.connection.send_media(audio_data)
            except Exception as e:
                print(f"Error sending audio: {e}")

    async def close(self):
        """Close the connection"""
        if self.is_open:
            try:
                # Cancel the keepalive task
                if self._keepalive_task:
                    self._keepalive_task.cancel()
                    try:
                        await self._keepalive_task
                    except asyncio.CancelledError:
                        pass

                # Cancel the listening task
                if self._listen_task:
                    self._listen_task.cancel()
                    try:
                        await self._listen_task
                    except asyncio.CancelledError:
                        pass

                # Exit the context manager
                if self._context_manager:
                    await self._context_manager.__aexit__(None, None, None)

                self.is_open = False
                print("Deepgram connection closed")
            except Exception as e:
                print(f"Error closing connection: {e}")
