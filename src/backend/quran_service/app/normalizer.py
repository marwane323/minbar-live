import regex as re
from rapidfuzz import fuzz

def normalize_arabic(text: str) -> str:
    """
    Normalize Arabic text for comparison by removing diacritics and normalizing characters.
    """
    if not text:
        return ""

    # 1. Remove tashkeel (diacritics)
    # \u064B - \u0652 are standard Arabic diacritics
    # \u0670 is superscript alef
    # \u0653 - \u0655 are maddah, hamza above/below
    text = re.sub(r'[\u064B-\u0652\u0670]', '', text)

    # 2. Normalize alef variants
    text = re.sub(r'[إأآٱ]', 'ا', text)

    # 3. Normalize taa marbuta to haa
    text = re.sub(r'ة', 'ه', text)

    # 4. Normalize alef maksura to yaa
    text = re.sub(r'ى', 'ي', text)
    
    # 5. Remove tatweel (kashida)
    text = re.sub(r'ـ', '', text)
    
    # Optional: Normalize hamza variants (waaw with hamza, yaa with hamza)
    text = re.sub(r'ؤ', 'و', text)
    text = re.sub(r'ئ', 'ي', text)
    text = re.sub(r'ء', '', text) # Just remove standalone hamza for matching

    # 6. Strip extra whitespace and punctuation
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()

    return text

def extract_arabic_words(text: str) -> list[str]:
    """Tokenize Arabic text into words."""
    normalized = normalize_arabic(text)
    return normalized.split() if normalized else []

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two strings using RapidFuzz."""
    # Using token sort ratio to handle word reorderings or partial matches
    # Returns 0-100, we convert to 0.0-1.0
    return fuzz.token_sort_ratio(text1, text2) / 100.0
