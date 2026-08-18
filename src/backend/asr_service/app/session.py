from typing import Dict, Optional, List
import time
import uuid
from app.schemas import ASRConfig, TranscriptionSegment

class ASRSession:
    def __init__(self, tenant_id: str, config: ASRConfig):
        self.session_id: str = str(uuid.uuid4())
        self.tenant_id: str = tenant_id
        self.start_time: float = time.time()
        self.config: ASRConfig = config
        self.accumulated_text: str = ""
        self.segments: List[TranscriptionSegment] = []

    def add_segment(self, segment: TranscriptionSegment):
        self.segments.append(segment)
        if self.accumulated_text:
            self.accumulated_text += " " + segment.text
        else:
            self.accumulated_text = segment.text

class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, ASRSession] = {}

    def create_session(self, tenant_id: str, config: ASRConfig) -> ASRSession:
        session = ASRSession(tenant_id, config)
        self._sessions[session.session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[ASRSession]:
        return self._sessions.get(session_id)

    def end_session(self, session_id: str) -> None:
        if session_id in self._sessions:
            del self._sessions[session_id]

    def get_active_count(self) -> int:
        return len(self._sessions)

# Global session manager instance
session_manager = SessionManager()
