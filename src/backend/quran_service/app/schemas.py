from pydantic import BaseModel
from typing import Optional, List, Dict

class QuranMatch(BaseModel):
    surah_number: int
    ayah_number: int
    surah_name: str
    surah_name_en: str
    arabic_text: str
    matched_portion: str
    similarity_score: float
    translations: Dict[str, str]
    reference: str

class HadithMatch(BaseModel):
    collection: str
    hadith_number: str
    arabic_text: str
    matched_portion: str
    similarity_score: float
    translations: Dict[str, str]
    grade: Optional[str] = None
    narrator_chain: Optional[str] = None

class DetectionRequest(BaseModel):
    text: str
    min_similarity: float = 0.85
    include_translations: bool = True
    target_languages: List[str] = ["en"]

class DetectionResponse(BaseModel):
    quran_matches: List[QuranMatch]
    hadith_matches: List[HadithMatch]
    processing_time_ms: float
    text_analyzed: str

class SegmentAnnotation(BaseModel):
    segment_type: str  # "speech" | "quran" | "hadith" | "dua"
    reference: Optional[str] = None
    match: Optional[QuranMatch | HadithMatch] = None
