from elevenlabs import ElevenLabs
from config import settings
from typing import Generator, AsyncGenerator
import asyncio


class ElevenLabsService:
    """Service for Text-to-Speech using ElevenLabs API"""

    def __init__(self):
        self.client = ElevenLabs(api_key=settings.elevenlabs_api_key)
        self.voice_id = settings.elevenlabs_voice_id
        self.model_id = settings.elevenlabs_model

    def generate_speech(self, text: str) -> bytes:
        """Generate speech audio from text (non-streaming)"""
        try:
            audio = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id=self.model_id,
                output_format="mp3_44100_128",
            )
            # Collect all chunks into bytes
            audio_bytes = b""
            for chunk in audio:
                if chunk:
                    audio_bytes += chunk
            return audio_bytes
        except Exception as e:
            print(f"ElevenLabs error: {e}")
            return b""

    def stream_speech(self, text: str) -> Generator[bytes, None, None]:
        """Stream speech audio chunks from text"""
        try:
            audio_stream = self.client.text_to_speech.convert_as_stream(
                voice_id=self.voice_id,
                text=text,
                model_id=self.model_id,
                output_format="mp3_44100_128",
            )

            for chunk in audio_stream:
                if chunk:
                    yield chunk
        except Exception as e:
            print(f"ElevenLabs streaming error: {e}")

    async def stream_speech_async(self, text: str) -> AsyncGenerator[bytes, None]:
        """Async generator for streaming speech"""
        try:
            audio_stream = self.client.text_to_speech.convert_as_stream(
                voice_id=self.voice_id,
                text=text,
                model_id=self.model_id,
                output_format="mp3_44100_128",
            )

            for chunk in audio_stream:
                if chunk:
                    yield chunk
                    await asyncio.sleep(0)  # Yield control to event loop
        except Exception as e:
            print(f"ElevenLabs async streaming error: {e}")

    def generate_greeting(self) -> bytes:
        """Generate the initial greeting audio"""
        greeting = "Hello! I'm your medical assistant. How can I help you today?"
        return self.generate_speech(greeting)

    def generate_goodbye(self) -> bytes:
        """Generate the goodbye audio"""
        goodbye = "Thank you for sharing. Take care and feel better soon!"
        return self.generate_speech(goodbye)
