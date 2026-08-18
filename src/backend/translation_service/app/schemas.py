from pydantic import BaseModel
from typing import Dict, List, Optional

class TranslationConfig(BaseModel):
    source_language: str = "ar"
    target_languages: list[str] = ["en"]
    model_provider: str = "ollama"  # ollama, openai, cohere
    model_name: str = "aya-expanse:32b"
    preserve_islamic_terms: bool = True
    use_glossary: bool = True

class TranslationRequest(BaseModel):
    text: str
    source_language: str = "ar"
    target_language: str = "en"
    segment_type: str = "speech"  # speech, quran, hadith, dua
    quran_reference: Optional[str] = None  # e.g., "2:255"
    hadith_reference: Optional[str] = None
    context: Optional[str] = None  # surrounding text for better translation
    glossary_overrides: Dict[str, str] = {}  # term -> forced translation

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    model_used: str
    is_official_translation: bool  # True for Quran verses
    processing_time_ms: float
    confidence: float

class BatchTranslationRequest(BaseModel):
    segments: list[TranslationRequest]
    config: TranslationConfig

class BatchTranslationResponse(BaseModel):
    translations: list[TranslationResponse]
    total_time_ms: float
