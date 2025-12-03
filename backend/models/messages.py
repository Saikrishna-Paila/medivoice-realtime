from pydantic import BaseModel
from typing import Literal, Optional, Any


class WSMessage(BaseModel):
    """Base WebSocket message"""
    type: str


class TranscriptMessage(BaseModel):
    """Transcription result message"""
    type: Literal["transcript"] = "transcript"
    text: str
    is_final: bool


class ResponseMessage(BaseModel):
    """AI response message"""
    type: Literal["response"] = "response"
    text: str


class AudioMessage(BaseModel):
    """Audio data message (metadata only, actual audio sent as bytes)"""
    type: Literal["audio"] = "audio"
    format: str = "mp3"


class SummaryMessage(BaseModel):
    """Medical summary message"""
    type: Literal["summary"] = "summary"
    data: dict


class ErrorMessage(BaseModel):
    """Error message"""
    type: Literal["error"] = "error"
    message: str


class StatusMessage(BaseModel):
    """Status update message"""
    type: Literal["status"] = "status"
    status: Literal["listening", "thinking", "speaking", "idle", "error"]
