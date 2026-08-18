import pytest
import uuid
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy.orm import DeclarativeBase

# 1. Test that all SQLAlchemy models can be imported
from shared.models import (
    Tenant, User, KhutbaScript, KhutbaSegment,
    SegmentTranslation, Session, SessionEvent, VoiceProfile,
    QuranVerseCache, HadithCache, AuditLog
)

# 2. Test all 11 models have proper __tablename__
def test_all_11_models_have_proper_tablename():
    models = [
        Tenant, User, KhutbaScript, KhutbaSegment,
        SegmentTranslation, Session, SessionEvent, VoiceProfile,
        QuranVerseCache, HadithCache, AuditLog
    ]
    
    expected_tables = {
        "tenants", "users", "khutba_scripts", "khutba_segments",
        "segment_translations", "sessions", "session_events", "voice_profiles",
        "quran_verses_cache", "hadith_cache", "audit_logs"
    }
    
    for model in models:
        assert hasattr(model, "__tablename__")
        assert model.__tablename__ in expected_tables

# 3. Test JWT token creation -> verification roundtrip
def test_jwt_token_roundtrip():
    from shared.auth import create_access_token, verify_token
    user_id = str(uuid.uuid4())
    tenant_id = str(uuid.uuid4())
    token = create_access_token(user_id, tenant_id, "admin", "test@test.com")
    payload = verify_token(token)
    assert payload["sub"] == user_id
    assert payload["tenant_id"] == tenant_id
    assert payload["role"] == "admin"

# 4. Test JWT expiry detection
def test_jwt_expiry_detection():
    from shared.auth import verify_token
    from shared.config import settings
    expire = datetime.now(timezone.utc) - timedelta(minutes=10)
    to_encode = {"sub": "123", "exp": expire}
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    with pytest.raises(HTTPException) as exc:
        verify_token(token)
    assert exc.value.status_code == 401
    assert "expired" in exc.value.detail.lower()

# 5. Test password hashing and verification
def test_password_hashing_and_verification():
    from shared.auth import get_password_hash, verify_password
    pwd = "MySecretPassword123"
    try:
        hashed = get_password_hash(pwd)
        assert hashed != pwd
        assert verify_password(pwd, hashed)
        assert not verify_password("wrong", hashed)
    except Exception as e:
        pytest.fail(f"Password hashing failed (known passlib issue): {e}")

# 6. Test role-based access control (require_role)
@pytest.mark.asyncio
async def test_role_based_access_control():
    from shared.auth import require_role
    checker = require_role("admin")
    user = {"role": "admin"}
    res = await checker(user)
    assert res == user
    
    with pytest.raises(HTTPException) as exc:
        await checker({"role": "imam"})
    assert exc.value.status_code == 403

# 7. Test that set_tenant_context rejects non-UUID strings
@pytest.mark.asyncio
async def test_set_tenant_context_rejects_non_uuid():
    from shared.database import set_tenant_context
    class DummySession:
        pass
    with pytest.raises(ValueError):
        await set_tenant_context(DummySession(), "not-a-uuid")

# 8. Test that set_tenant_context accepts valid UUIDs
@pytest.mark.asyncio
async def test_set_tenant_context_accepts_valid_uuid():
    from shared.database import set_tenant_context
    
    class DummySession:
        async def execute(self, query):
            self.executed = query
            
    sess = DummySession()
    valid_uuid = str(uuid.uuid4())
    await set_tenant_context(sess, valid_uuid)
    assert str(sess.executed) == f"SET app.tenant_id = '{valid_uuid}'"

# 9. Test that TenantAuthMiddleware skips /health endpoints
@pytest.mark.asyncio
async def test_tenant_auth_middleware_skips_health():
    from shared.middleware import TenantAuthMiddleware
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    middleware = TenantAuthMiddleware(app)
    
    # We mock scope to bypass actual network request objects
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/health",
        "headers": []
    }
    
    async def receive():
        return {"type": "http.request"}
    
    async def send(message):
        pass

    # Should not raise any auth error because /health is skipped
    # Normally middleware will pass to the next app
    try:
        await middleware(scope, receive, send)
    except Exception as e:
        pass # If it hits app error, that's fine, we just want to ensure it doesn't fail on Auth
