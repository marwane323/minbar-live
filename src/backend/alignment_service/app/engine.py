import time
import uuid
from typing import Optional, Union
from rapidfuzz import fuzz

from .schemas import AlignmentConfig, SegmentMatchEvent, AlignmentState, DeviationEvent
from .normalizer import ArabicNormalizer

class AlignmentEngine:
    def __init__(self, script_id: str, session_id: str, segments: list[str], config: AlignmentConfig):
        self.script_id = script_id
        self.session_id = session_id
        self.original_segments = segments
        self.normalized_segments = [ArabicNormalizer.normalize(seg) for seg in segments]
        self.config = config
        
        self.current_index = 0
        self.confidence = 1.0
        self.matched_segments = 0
        self.deviation_count = 0
        self.started_at = time.time()
        self.last_match_at: Optional[float] = None

    async def process_asr_input(self, asr_text: str) -> Union[SegmentMatchEvent, DeviationEvent, None]:
        if not asr_text.strip():
            return None
            
        norm_asr = ArabicNormalizer.normalize(asr_text)
        if not norm_asr:
            return None

        # Determine search window
        start_idx = max(0, self.current_index)
        end_idx = min(len(self.normalized_segments), self.current_index + self.config.window_size)
        
        best_match_idx = -1
        best_score = 0.0
        
        # Check normal window
        for i in range(start_idx, end_idx):
            score = fuzz.partial_ratio(self.normalized_segments[i], norm_asr) / 100.0
            if score > best_score:
                best_score = score
                best_match_idx = i

        # Check drift correction if enabled and best score is low
        if self.config.drift_correction and best_score < self.config.similarity_threshold:
            drift_end = min(len(self.normalized_segments), end_idx + self.config.max_drift_segments)
            for i in range(end_idx, drift_end):
                score = fuzz.partial_ratio(self.normalized_segments[i], norm_asr) / 100.0
                if score > best_score:
                    best_score = score
                    best_match_idx = i

        # Evaluate best match
        if best_score >= self.config.similarity_threshold:
            # We found a match
            self.current_index = best_match_idx + 1 # Advance to next segment
            self.matched_segments += 1
            self.confidence = min(1.0, self.confidence + 0.1)
            self.last_match_at = time.time()
            
            return SegmentMatchEvent(
                script_id=self.script_id,
                segment_index=best_match_idx,
                segment_id=str(uuid.uuid4()), # Dummy ID
                segment_text=self.original_segments[best_match_idx],
                asr_text=asr_text,
                similarity_score=best_score,
                confidence=self.confidence,
                is_deviation=False,
                timestamp=time.time()
            )
        else:
            # Deviation
            self.deviation_count += 1
            self.confidence = max(0.0, self.confidence - 0.2)
            
            expected_text = ""
            if self.current_index < len(self.original_segments):
                expected_text = self.original_segments[self.current_index]
                
            return DeviationEvent(
                session_id=self.session_id,
                asr_text=asr_text,
                expected_text=expected_text,
                timestamp=time.time()
            )

    def get_state(self) -> AlignmentState:
        return AlignmentState(
            session_id=self.session_id,
            script_id=self.script_id,
            current_index=self.current_index,
            confidence=self.confidence,
            total_segments=len(self.original_segments),
            matched_segments=self.matched_segments,
            deviation_count=self.deviation_count,
            started_at=self.started_at,
            last_match_at=self.last_match_at
        )

    def reset(self):
        self.current_index = 0
        self.confidence = 1.0
        self.matched_segments = 0
        self.deviation_count = 0
        self.started_at = time.time()
        self.last_match_at = None
