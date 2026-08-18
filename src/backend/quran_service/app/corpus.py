import json
import logging
from pathlib import Path
from typing import Optional, Dict

from rapidfuzz import fuzz

from app.schemas import QuranMatch
from app.normalizer import normalize_arabic, extract_arabic_words

logger = logging.getLogger(__name__)

class QuranCorpus:
    def __init__(self):
        self.metadata: Dict[int, Dict] = {}
        self.verses: list[dict] = []
        self.normalized_verses: list[dict] = []
        
    def load(self, data_dir: Optional[Path] = None):
        """Load the Quran corpus from JSON files."""
        if data_dir is None:
            data_dir = Path(__file__).parent / "data"
            
        try:
            # Load metadata
            meta_path = data_dir / "quran_metadata.json"
            if meta_path.exists():
                with open(meta_path, "r", encoding="utf-8") as f:
                    meta_list = json.load(f)
                    for item in meta_list:
                        self.metadata[item["surah_number"]] = item
            
            # Load verses (TODO: In production, load full quran.json or from DB)
            verses_path = data_dir / "quran.json"
            if verses_path.exists():
                with open(verses_path, "r", encoding="utf-8") as f:
                    self.verses = json.load(f)
            
            # Precompute normalized text and trigrams
            for verse in self.verses:
                normalized = normalize_arabic(verse["text"])
                words = normalized.split()
                # Create trigrams for fast matching
                trigrams = [" ".join(words[i:i+3]) for i in range(len(words)-2)]
                
                self.normalized_verses.append({
                    "surah_number": verse["surah_number"],
                    "ayah_number": verse["ayah_number"],
                    "original": verse["text"],
                    "normalized": normalized,
                    "trigrams": trigrams,
                    "translations": verse.get("translations", {})
                })
                
            logger.info(f"Loaded {len(self.verses)} Quran verses and metadata for {len(self.metadata)} surahs")
        except Exception as e:
            logger.error(f"Error loading Quran corpus: {e}")
            raise

    def get_verse(self, surah: int, ayah: int) -> Optional[QuranMatch]:
        """Get a specific verse by surah and ayah number."""
        for v in self.normalized_verses:
            if v["surah_number"] == surah and v["ayah_number"] == ayah:
                meta = self.metadata.get(surah, {"name_ar": "Unknown", "name_en": "Unknown"})
                return QuranMatch(
                    surah_number=surah,
                    ayah_number=ayah,
                    surah_name=meta.get("name_ar", "Unknown"),
                    surah_name_en=meta.get("name_en", "Unknown"),
                    arabic_text=v["original"],
                    matched_portion=v["original"],
                    similarity_score=1.0,
                    translations=v["translations"],
                    reference=f"{surah}:{ayah}"
                )
        return None

    def search(self, text: str, threshold: float = 0.85) -> list[QuranMatch]:
        """Search for matches in the corpus."""
        normalized_query = normalize_arabic(text)
        if not normalized_query:
            return []

        matches = []
        query_words = normalized_query.split()
        
        # Simple optimization: query must have at least 3 words to avoid false positives
        if len(query_words) < 3:
            return matches

        for v in self.normalized_verses:
            # Quick filter using token_set_ratio first
            quick_score = fuzz.token_set_ratio(normalized_query, v["normalized"]) / 100.0
            
            if quick_score > 0.5: # Lower threshold for initial pass
                # Calculate more accurate partial ratio
                score = fuzz.partial_ratio(normalized_query, v["normalized"]) / 100.0
                
                if score >= threshold:
                    meta = self.metadata.get(v["surah_number"], {"name_ar": "Unknown", "name_en": "Unknown"})
                    matches.append(QuranMatch(
                        surah_number=v["surah_number"],
                        ayah_number=v["ayah_number"],
                        surah_name=meta.get("name_ar", "Unknown"),
                        surah_name_en=meta.get("name_en", "Unknown"),
                        arabic_text=v["original"],
                        matched_portion=normalized_query, # In a real implementation we would extract the exact substring
                        similarity_score=score,
                        translations=v["translations"],
                        reference=f"{v['surah_number']}:{v['ayah_number']}"
                    ))
                    
        # Sort by similarity descending
        matches.sort(key=lambda x: x.similarity_score, reverse=True)
        return matches

# Singleton instance
quran_corpus = QuranCorpus()
