from typing import Dict

ISLAMIC_GLOSSARY = {
    "ar": {
        "الله": {"en": "Allah", "fr": "Allah", "es": "Allah"},
        "صلى الله عليه وسلم": {"en": "peace be upon him", "fr": "paix soit sur lui"},
        "سبحانه وتعالى": {"en": "glorified and exalted be He", "fr": "glorifié et exalté soit-Il"},
        "إن شاء الله": {"en": "if Allah wills", "fr": "si Allah le veut"},
        "الحمد لله": {"en": "praise be to Allah", "fr": "louange à Allah"},
        "بسم الله الرحمن الرحيم": {"en": "In the name of Allah, the Most Gracious, the Most Merciful"},
        "جل جلاله": {"en": "may His glory be glorified", "fr": "que Sa Majesté soit glorifiée"},
        "رضي الله عنه": {"en": "may Allah be pleased with him"},
        "رحمه الله": {"en": "may Allah have mercy on him"},
        "أستغفر الله": {"en": "I seek Allah's forgiveness"},
        "ما شاء الله": {"en": "as Allah has willed"},
        "لا إله إلا الله": {"en": "there is no deity but Allah"},
        "سبحان الله": {"en": "glory be to Allah"},
        "الله أكبر": {"en": "Allah is the greatest"},
        "إنا لله وإنا إليه راجعون": {"en": "indeed we belong to Allah, and indeed to Him we will return"},
        "بارك الله فيك": {"en": "may Allah bless you"},
        "جزاك الله خيرا": {"en": "may Allah reward you with goodness"},
        "لا حول ولا قوة إلا بالله": {"en": "there is no power nor strength except with Allah"},
        "تقبل الله": {"en": "may Allah accept"},
        "السلام عليكم ورحمة الله وبركاته": {"en": "peace, mercy and blessings of Allah be upon you"},
        "الجنة": {"en": "Jannah (Paradise)"},
        "النار": {"en": "Jahanam (Hellfire)"},
        "القرآن": {"en": "Quran"},
        "السنة": {"en": "Sunnah"},
        "الإيمان": {"en": "Iman (faith)"},
    }
}

class GlossaryManager:
    def __init__(self, custom_glossary: Dict[str, Dict[str, Dict[str, str]]] = None):
        self.glossary = ISLAMIC_GLOSSARY.copy()
        if custom_glossary:
            for lang, terms in custom_glossary.items():
                if lang not in self.glossary:
                    self.glossary[lang] = {}
                for term, translations in terms.items():
                    self.glossary[lang][term] = translations

    def get_terms(self, source_lang: str, target_lang: str) -> Dict[str, str]:
        if source_lang not in self.glossary:
            return {}
        
        result = {}
        for term, translations in self.glossary[source_lang].items():
            if target_lang in translations:
                result[term] = translations[target_lang]
        return result

    def apply_glossary(self, text: str, target_lang: str) -> str:
        # Simplistic post-processing application.
        # In a real scenario, this might need NLP to find terms accurately
        return text
