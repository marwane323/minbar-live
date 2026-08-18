import json
import logging
from pathlib import Path
from typing import Optional

from rapidfuzz import fuzz

from app.schemas import HadithMatch
from app.normalizer import normalize_arabic

logger = logging.getLogger(__name__)

class HadithMatcher:
    def __init__(self):
        self.hadiths: list[dict] = []
        self.normalized_hadiths: list[dict] = []
        
    def load(self, data_dir: Optional[Path] = None):
        """Load the Hadith corpus from JSON files."""
        if data_dir is None:
            data_dir = Path(__file__).parent / "data"
            
        try:
            # Load hadiths (TODO: In production, load from hadith-api/sunnah.com or DB)
            hadith_path = data_dir / "hadith.json"
            if hadith_path.exists():
                with open(hadith_path, "r", encoding="utf-8") as f:
                    self.hadiths = json.load(f)
            
            # Precompute normalized text
            for h in self.hadiths:
                normalized = normalize_arabic(h["text"])
                
                self.normalized_hadiths.append({
                    "collection": h["collection"],
                    "hadith_number": h["hadith_number"],
                    "original": h["text"],
                    "normalized": normalized,
                    "translations": h.get("translations", {}),
                    "grade": h.get("grade"),
                    "narrator_chain": h.get("narrator_chain")
                })
                
            logger.info(f"Loaded {len(self.hadiths)} Hadiths")
        except Exception as e:
            logger.error(f"Error loading Hadith corpus: {e}")
            raise

    def get_hadith(self, collection: str, number: str) -> Optional[HadithMatch]:
        """Get a specific hadith by collection and number."""
        for h in self.normalized_hadiths:
            if h["collection"] == collection and h["hadith_number"] == number:
                return HadithMatch(
                    collection=h["collection"],
                    hadith_number=h["hadith_number"],
                    arabic_text=h["original"],
                    matched_portion=h["original"],
                    similarity_score=1.0,
                    translations=h["translations"],
                    grade=h["grade"],
                    narrator_chain=h["narrator_chain"]
                )
        return None

    def search(self, text: str, threshold: float = 0.85) -> list[HadithMatch]:
        """Search for matches in the corpus."""
        normalized_query = normalize_arabic(text)
        if not normalized_query:
            return []

        matches = []
        query_words = normalized_query.split()
        
        if len(query_words) < 3:
            return matches

        for h in self.normalized_hadiths:
            # We use partial_ratio because hadith texts can be very long (with narrator chain)
            # and the speaker might only quote a small part (matn)
            score = fuzz.partial_ratio(normalized_query, h["normalized"]) / 100.0
            
            if score >= threshold:
                matches.append(HadithMatch(
                    collection=h["collection"],
                    hadith_number=h["hadith_number"],
                    arabic_text=h["original"],
                    matched_portion=normalized_query,
                    similarity_score=score,
                    translations=h["translations"],
                    grade=h["grade"],
                    narrator_chain=h["narrator_chain"]
                ))
                    
        # Sort by similarity descending
        matches.sort(key=lambda x: x.similarity_score, reverse=True)
        return matches

# Singleton instance
hadith_matcher = HadithMatcher()
