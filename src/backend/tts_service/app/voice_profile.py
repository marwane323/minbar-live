from typing import Dict, List, Optional
from .engine import ChatterboxEngine

class VoiceProfileManager:
    def __init__(self):
        self._profiles: Dict[str, dict] = {}
        self._engine = ChatterboxEngine()

    async def create_profile(self, audio_sample_url: str, imam_id: str, tenant_id: str) -> dict:
        profile = await self._engine.clone_voice(audio_sample_url)
        profile.update({
            "imam_id": imam_id,
            "tenant_id": tenant_id
        })
        self._profiles[profile["voice_id"]] = profile
        return profile

    def get_profile(self, voice_id: str) -> Optional[dict]:
        return self._profiles.get(voice_id)

    def list_profiles(self, tenant_id: str) -> List[dict]:
        return [p for p in self._profiles.values() if p.get("tenant_id") == tenant_id]

# Singleton instance
voice_profile_manager = VoiceProfileManager()
