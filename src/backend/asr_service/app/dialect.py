from typing import Tuple

# Common keyword markers for Arabic dialects
DIALECT_MARKERS = {
    "Egyptian": ["عشان", "إزيك", "كده", "دلوقتي", "أوي", "بقى", "ليه", "ايه"],
    "Gulf": ["وش", "شلونك", "وايد", "تكفى", "أبشر", "هلا", "زين"],
    "Levantine": ["هيك", "كيفك", "شو", "هلق", "بدي", "منيح", "كتير"],
    "Maghrebi": ["بزاف", "واخا", "ديالي", "دابا", "شنو", "كيداير"],
    "MSA": ["كيف", "لماذا", "هل", "نعم", "الآن", "كثيرا", "جدا", "أيضا"]
}

def detect_dialect(text: str) -> Tuple[str, float]:
    """
    Detects Arabic dialect based on keyword heuristics.
    Returns (dialect, confidence).
    # TODO: Implement an ML-based dialect detection model.
    """
    words = text.split()
    if not words:
        return "MSA", 1.0

    scores = {dialect: 0 for dialect in DIALECT_MARKERS}
    
    for word in words:
        for dialect, markers in DIALECT_MARKERS.items():
            if word in markers:
                scores[dialect] += 1
                
    total_markers = sum(scores.values())
    if total_markers == 0:
        return "MSA", 0.5  # Default to MSA with lower confidence if no markers found
        
    best_dialect = max(scores, key=scores.get)
    confidence = scores[best_dialect] / total_markers
    
    return best_dialect, confidence
