from pydantic import BaseModel, Field
from typing import Dict, Any, Literal, Set
from datetime import datetime, timezone

class BroadcastEvent(BaseModel):
    event_type: Literal["transcription", "translation", "alignment", "quran_detection", "tts_ready", "session_start", "session_end"]
    payload: Dict[str, Any]
    session_id: str
    tenant_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ListenerConnection(BaseModel):
    connection_id: str
    session_id: str
    tenant_id: str
    language_preference: str | None = None
    audio_enabled: bool = False
    connected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionRoom(BaseModel):
    session_id: str
    tenant_id: str
    listeners: Set[str] = Field(default_factory=set)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HubStats(BaseModel):
    total_connections: int = 0
    active_sessions: int = 0
    messages_per_second: float = 0.0
