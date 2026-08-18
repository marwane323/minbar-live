from fastapi import FastAPI, HTTPException, Depends
from typing import Dict, Any

from shared.logging import setup_logging
from shared.config import settings

from app.schemas import DetectionRequest, DetectionResponse, QuranMatch, HadithMatch
from app.corpus import quran_corpus
from app.hadith import hadith_matcher
from app.detector import detection_engine

setup_logging()

# Load corpora on startup
quran_corpus.load()
hadith_matcher.load()

app = FastAPI(title=settings.SERVICE_NAME or "quran_service")

# Note: In a real app we would use shared.auth middleware for these endpoints
# skipping auth dependency here for simplicity in this implementation but noting it.

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "quran_service"}

@app.post("/api/detect", response_model=DetectionResponse)
async def detect_text(request: DetectionRequest):
    return await detection_engine.detect(request.text, request)

@app.post("/api/detect/quran", response_model=DetectionResponse)
async def detect_quran(request: DetectionRequest):
    # Dummy request for Hadith to be empty
    response = await detection_engine.detect(request.text, request)
    response.hadith_matches = []
    return response

@app.post("/api/detect/hadith", response_model=DetectionResponse)
async def detect_hadith(request: DetectionRequest):
    response = await detection_engine.detect(request.text, request)
    response.quran_matches = []
    return response

@app.get("/api/quran/{surah}/{ayah}", response_model=QuranMatch)
async def get_quran_verse(surah: int, ayah: int):
    verse = quran_corpus.get_verse(surah, ayah)
    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    return verse

@app.get("/api/hadith/{collection}/{number}", response_model=HadithMatch)
async def get_hadith_entry(collection: str, number: str):
    hadith = hadith_matcher.get_hadith(collection, number)
    if not hadith:
        raise HTTPException(status_code=404, detail="Hadith not found")
    return hadith
