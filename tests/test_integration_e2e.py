"""
Minbar Live — Integration Test Script
Tests basic application features against running services.

Requirements:
  - Docker Compose infra running (postgres, redis, minio)
  - API Gateway running locally or in Docker
  
Usage:
  $env:PYTHONPATH = "C:\Projects\Khutba\minbar-live\src\backend\shared"
  python tests/test_integration_e2e.py
"""
import asyncio
import httpx
import json
import sys
import uuid
from datetime import datetime


# Configuration
API_BASE = "http://localhost:8000"
ASR_BASE = "http://localhost:8001"
QURAN_BASE = "http://localhost:8005"
ALIGNMENT_BASE = "http://localhost:8002"
TRANSLATION_BASE = "http://localhost:8003"
TTS_BASE = "http://localhost:8004"
WS_BASE = "ws://localhost:8006"

# Test credentials
ADMIN_EMAIL = "admin@al-noor.test"
ADMIN_PASSWORD = "minbar_dev_123"
IMAM_EMAIL = "imam@al-noor.test"
IMAM_PASSWORD = "minbar_dev_123"


class TestResult:
    def __init__(self, name: str, passed: bool, detail: str = ""):
        self.name = name
        self.passed = passed
        self.detail = detail

    def __str__(self):
        status = "✅ PASS" if self.passed else "❌ FAIL"
        detail = f" — {self.detail}" if self.detail else ""
        return f"  {status} | {self.name}{detail}"


results: list[TestResult] = []


def record(name: str, passed: bool, detail: str = ""):
    results.append(TestResult(name, passed, detail))


async def test_health_checks():
    """Test that all service health endpoints respond."""
    services = {
        "API Gateway": f"{API_BASE}/health",
        "ASR Service": f"{ASR_BASE}/health",
        "Quran Service": f"{QURAN_BASE}/health",
        "Alignment Service": f"{ALIGNMENT_BASE}/health",
        "Translation Service": f"{TRANSLATION_BASE}/health",
        "TTS Service": f"{TTS_BASE}/health",
    }
    async with httpx.AsyncClient(timeout=5) as client:
        for name, url in services.items():
            try:
                r = await client.get(url)
                record(f"Health: {name}", r.status_code == 200, f"status={r.status_code}")
            except Exception as e:
                record(f"Health: {name}", False, f"unreachable: {e}")


async def test_auth_login():
    """Test login flow with seed credentials."""
    async with httpx.AsyncClient(timeout=10) as client:
        # Admin login
        r = await client.post(
            f"{API_BASE}/api/auth/login",
            data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if r.status_code == 200:
            token = r.json().get("access_token")
            record("Auth: Admin login", bool(token), "got access_token")

            # Test /me endpoint
            r2 = await client.get(
                f"{API_BASE}/api/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            record("Auth: /me endpoint", r2.status_code == 200, f"role={r2.json().get('role')}")

            # Test token refresh
            r3 = await client.post(
                f"{API_BASE}/api/auth/refresh",
                headers={"Authorization": f"Bearer {token}"},
            )
            record("Auth: Token refresh", r3.status_code == 200)
            return token
        else:
            record("Auth: Admin login", False, f"status={r.status_code} body={r.text[:100]}")
            return None


async def test_quran_detection(token: str | None):
    """Test Quran verse detection with Al-Fatiha."""
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        # Detect Al-Fatiha
        r = await client.post(
            f"{QURAN_BASE}/api/detect/quran",
            json={
                "text": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                "min_similarity": 0.75,
            },
            headers=headers,
        )
        if r.status_code == 200:
            matches = r.json().get("quran_matches", [])
            record("Quran: Al-Fatiha detection", len(matches) > 0, f"{len(matches)} matches")
        else:
            record("Quran: Al-Fatiha detection", False, f"status={r.status_code}")

        # Negative test — non-Quranic text
        r2 = await client.post(
            f"{QURAN_BASE}/api/detect/quran",
            json={
                "text": "ذهبت إلى السوق لشراء الخضروات",
                "min_similarity": 0.85,
            },
            headers=headers,
        )
        if r2.status_code == 200:
            matches2 = r2.json().get("quran_matches", [])
            record("Quran: No false positives", len(matches2) == 0, f"{len(matches2)} matches")
        else:
            record("Quran: No false positives", False, f"status={r2.status_code}")

        # Get specific verse
        r3 = await client.get(f"{QURAN_BASE}/api/quran/1/1", headers=headers)
        record("Quran: Get verse 1:1", r3.status_code == 200)


async def test_translation(token: str | None):
    """Test translation service with Islamic context."""
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        r = await client.post(
            f"{TRANSLATION_BASE}/api/translate",
            json={
                "text": "الحمد لله رب العالمين",
                "source_language": "ar",
                "target_language": "en",
                "segment_type": "speech",
            },
            headers=headers,
        )
        if r.status_code == 200:
            data = r.json()
            record(
                "Translation: Arabic to English",
                bool(data.get("translated_text")),
                f"model={data.get('model_used', 'unknown')}",
            )
        else:
            record("Translation: Arabic to English", False, f"status={r.status_code}")

        # Test glossary endpoint
        r2 = await client.get(f"{TRANSLATION_BASE}/api/translate/glossary", headers=headers)
        record("Translation: Glossary endpoint", r2.status_code == 200)


async def test_tts(token: str | None):
    """Test TTS synthesis (simulation mode)."""
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        r = await client.post(
            f"{TTS_BASE}/api/tts/synthesize",
            json={
                "text": "Praise be to Allah, Lord of all the worlds",
                "language": "en",
            },
            headers=headers,
        )
        record("TTS: Synthesize audio", r.status_code == 200, f"status={r.status_code}")

        # Test voice profile creation
        r2 = await client.post(
            f"{TTS_BASE}/api/voice/profile",
            json={
                "imam_id": str(uuid.uuid4()),
                "tenant_id": str(uuid.uuid4()),
            },
            headers=headers,
        )
        record("TTS: Voice profile creation", r2.status_code in (200, 201), f"status={r2.status_code}")


async def test_alignment(token: str | None):
    """Test alignment session lifecycle."""
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        # Start alignment session with sample segments
        r = await client.post(
            f"{ALIGNMENT_BASE}/api/align/start",
            json={
                "segments": [
                    "الحمد لله رب العالمين",
                    "الرحمن الرحيم",
                    "مالك يوم الدين",
                ],
            },
            headers=headers,
        )
        if r.status_code == 200:
            data = r.json()
            session_id = data.get("session_id")
            record("Alignment: Start session", bool(session_id), f"session={session_id}")

            if session_id:
                # Process ASR input
                r2 = await client.post(
                    f"{ALIGNMENT_BASE}/api/align/{session_id}/process",
                    json={"text": "الحمد لله رب العالمين"},
                    headers=headers,
                )
                record("Alignment: Process input", r2.status_code == 200)

                # Get state
                r3 = await client.get(
                    f"{ALIGNMENT_BASE}/api/align/{session_id}/state",
                    headers=headers,
                )
                record("Alignment: Get state", r3.status_code == 200)
        else:
            record("Alignment: Start session", False, f"status={r.status_code}")


async def main():
    print("=" * 60)
    print("🕌 Minbar Live — Integration Test Suite")
    print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    print("\n📡 Testing Health Checks...")
    await test_health_checks()

    print("\n🔐 Testing Authentication...")
    token = await test_auth_login()

    print("\n📖 Testing Quran Detection...")
    await test_quran_detection(token)

    print("\n🌐 Testing Translation...")
    await test_translation(token)

    print("\n🔊 Testing TTS...")
    await test_tts(token)

    print("\n📐 Testing Alignment...")
    await test_alignment(token)

    # Print results
    print("\n" + "=" * 60)
    print("📊 RESULTS")
    print("=" * 60)
    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    for r in results:
        print(r)
    print(f"\n{'=' * 60}")
    print(f"  Total: {len(results)} | Passed: {passed} | Failed: {failed}")
    print(f"  Pass Rate: {passed / len(results) * 100:.0f}%")
    print(f"{'=' * 60}")
    
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    asyncio.run(main())
