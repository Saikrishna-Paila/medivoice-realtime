from typing import Dict, List, Optional
from datetime import datetime
import uuid


class Session:
    """Represents a single conversation session"""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.messages: List[Dict] = []
        self.started_at = datetime.now()
        self.ended_at: Optional[datetime] = None

    def add_message(self, role: str, content: str):
        """Add a message to the conversation history"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })

    def get_messages(self) -> List[Dict]:
        """Get messages formatted for LLM (role and content only)"""
        return [{"role": m["role"], "content": m["content"]} for m in self.messages]

    def get_full_history(self) -> List[Dict]:
        """Get full message history with timestamps"""
        return self.messages.copy()

    def end(self):
        """Mark session as ended"""
        self.ended_at = datetime.now()


class SessionManager:
    """Manages all active conversation sessions"""

    def __init__(self):
        self.sessions: Dict[str, Session] = {}

    def create_session(self) -> str:
        """Create a new session and return its ID"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = Session(session_id)
        print(f"Created session: {session_id}")
        return session_id

    def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID"""
        return self.sessions.get(session_id)

    def add_message(self, session_id: str, role: str, content: str):
        """Add a message to a session"""
        if session_id in self.sessions:
            self.sessions[session_id].add_message(role, content)

    def get_conversation(self, session_id: str) -> List[Dict]:
        """Get conversation history for LLM"""
        if session_id in self.sessions:
            return self.sessions[session_id].get_messages()
        return []

    def end_session(self, session_id: str) -> Optional[List[Dict]]:
        """End a session and return full history"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            session.end()
            history = session.get_full_history()
            del self.sessions[session_id]
            print(f"Ended session: {session_id}")
            return history
        return None
