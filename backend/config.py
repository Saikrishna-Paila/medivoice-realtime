from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    # API Keys
    deepgram_api_key: str = ""
    groq_api_key: str = ""
    elevenlabs_api_key: str = ""

    # Server
    backend_port: int = 8000
    frontend_url: str = "http://localhost:3000"

    # Deepgram settings
    deepgram_model: str = "nova-2"
    deepgram_language: str = "en"

    # Groq settings
    groq_model: str = "llama-3.3-70b-versatile"
    groq_max_tokens: int = 300
    groq_temperature: float = 0.7

    # ElevenLabs settings
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice
    elevenlabs_model: str = "eleven_turbo_v2_5"

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
