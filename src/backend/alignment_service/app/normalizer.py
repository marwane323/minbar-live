import regex

class ArabicNormalizer:
    @staticmethod
    def normalize(text: str) -> str:
        if not text:
            return ""
        # Remove diacritics
        text = regex.sub(r'[\u064B-\u065F\u0670]', '', text)
        # Normalize alef
        text = regex.sub(r'[إأآٱ]', 'ا', text)
        # Normalize taa marbuta
        text = text.replace('ة', 'ه')
        # Normalize alef maksura
        text = text.replace('ى', 'ي')
        # Remove tatweel
        text = text.replace('ـ', '')
        return text.strip()
