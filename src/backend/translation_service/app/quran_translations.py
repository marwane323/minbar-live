from typing import Optional

DEFAULT_TRANSLATIONS = {
    "en": {
        "1:1": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        "2:255": "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence..."
    }
}

class QuranTranslationHandler:
    def __init__(self, data_dir: str = None):
        self.translations = DEFAULT_TRANSLATIONS

    def get_official_translation(self, surah: int, ayah: int, target_lang: str) -> Optional[str]:
        ref = f"{surah}:{ayah}"
        if target_lang in self.translations and ref in self.translations[target_lang]:
            return self.translations[target_lang][ref]
        return None
