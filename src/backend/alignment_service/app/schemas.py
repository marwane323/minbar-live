from pydantic import BaseModel
from typing import Optional

class AlignmentConfig(BaseModel):
    window_size: int = 5  # sliding window of segments to consider
    similarity_threshold: float = 0.75
    drift_correction: bool = True
    max_drift_segments: int = 3

class SegmentMatchEvent(BaseModel):
    event_type: str = "SEGMENT_MATCH"
    script_id: str  # UUID of the khutba_script
    segment_index: int  # Current position in script
    segment_id: str  # UUID of the matched segment
    segment_text: str  # The script segment text
    asr_text: str  # The live ASR text that matched
    similarity_score: float
    confidence: float  # Overall confidence of position
    is_deviation: bool  # True if imam deviated from script
    timestamp: float

class AlignmentState(BaseModel):
    session_id: str
    script_id: str
    current_index: int = 0
    confidence: float = 1.0
    total_segments: int = 0
    matched_segments: int = 0
    deviation_count: int = 0
    started_at: float
    last_match_at: Optional[float] = None

class DeviationEvent(BaseModel):
    event_type: str = "DEVIATION"
    session_id: str
    asr_text: str  # What the imam actually said
    expected_text: str  # What was expected
    timestamp: float

class AlignmentStartRequest(BaseModel):
    script_id: str
    segments: list[str]
