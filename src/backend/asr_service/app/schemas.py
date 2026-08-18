from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ASRConfig(BaseModel):
    language: str = "ar"
    model: str = "cohere-arabic"  # or "whisper-v3-turbo"
    dialect: Optional[str] = None  # MSA, Egyptian, Gulf, Levantine, Maghrebi
    enable_timestamps: bool = True
    enable_confidence: bool = True

class TranscriptionWord(BaseModel):
    text: str
    start_time: float
    end_time: float
    confidence: float

class TranscriptionSegment(BaseModel):
    text: str
    words: List[TranscriptionWord]
    language: str
    dialect: Optional[str] = None
    is_final: bool
    segment_id: int
    timestamp: float

class ASREvent(BaseModel):
    event_type: str  # "partial" | "final" | "error" | "dialect_change"
    segment: Optional[TranscriptionSegment] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
