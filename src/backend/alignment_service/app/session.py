import uuid
from typing import Dict, Optional, Union
from .engine import AlignmentEngine
from .schemas import AlignmentConfig, AlignmentState, SegmentMatchEvent, DeviationEvent

class AlignmentSession:
    def __init__(self, script_id: str, segments: list[str], config: AlignmentConfig):
        self.session_id = str(uuid.uuid4())
        self.engine = AlignmentEngine(script_id, self.session_id, segments, config)
        self.event_history = []

    async def process_input(self, asr_text: str) -> Union[SegmentMatchEvent, DeviationEvent, None]:
        event = await self.engine.process_asr_input(asr_text)
        if event:
            self.event_history.append(event)
        return event

    def get_state(self) -> AlignmentState:
        return self.engine.get_state()

class SessionStore:
    def __init__(self):
        self.sessions: Dict[str, AlignmentSession] = {}

    def create_session(self, script_id: str, segments: list[str], config: Optional[AlignmentConfig] = None) -> str:
        if config is None:
            config = AlignmentConfig()
        session = AlignmentSession(script_id, segments, config)
        self.sessions[session.session_id] = session
        return session.session_id

    def get_session(self, session_id: str) -> Optional[AlignmentSession]:
        return self.sessions.get(session_id)

    def end_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

session_store = SessionStore()
