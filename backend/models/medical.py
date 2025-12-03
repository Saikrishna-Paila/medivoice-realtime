from pydantic import BaseModel
from typing import List, Optional


class MedicalSummary(BaseModel):
    """Structured medical summary"""
    chief_complaint: str
    history_of_present_illness: str
    relevant_history: List[str]
    assessment: str
    recommendations: List[str]


class ConversationMessage(BaseModel):
    """A single message in the conversation"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None
