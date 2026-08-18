import time
import asyncio
import logging

from app.schemas import DetectionRequest, DetectionResponse
from app.corpus import quran_corpus
from app.hadith import hadith_matcher

logger = logging.getLogger(__name__)

class DetectionEngine:
    async def detect(self, text: str, config: DetectionRequest) -> DetectionResponse:
        start_time = time.perf_counter()
        
        # Run Quran and Hadith matching concurrently
        quran_task = asyncio.create_task(self._search_quran(text, config.min_similarity))
        hadith_task = asyncio.create_task(self._search_hadith(text, config.min_similarity))
        
        quran_matches, hadith_matches = await asyncio.gather(quran_task, hadith_task)
        
        end_time = time.perf_counter()
        processing_time_ms = (end_time - start_time) * 1000
        
        # Filter translations based on target_languages
        if not config.include_translations:
            for m in quran_matches:
                m.translations = {}
            for m in hadith_matches:
                m.translations = {}
        else:
            for m in quran_matches:
                m.translations = {k: v for k, v in m.translations.items() if k in config.target_languages}
            for m in hadith_matches:
                m.translations = {k: v for k, v in m.translations.items() if k in config.target_languages}
        
        return DetectionResponse(
            quran_matches=quran_matches,
            hadith_matches=hadith_matches,
            processing_time_ms=processing_time_ms,
            text_analyzed=text
        )

    async def _search_quran(self, text: str, min_similarity: float):
        # In a more advanced implementation, this would use sliding windows
        # For now we use the partial_ratio matching from RapidFuzz
        return quran_corpus.search(text, min_similarity)
        
    async def _search_hadith(self, text: str, min_similarity: float):
        return hadith_matcher.search(text, min_similarity)

detection_engine = DetectionEngine()
