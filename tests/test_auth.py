import pytest
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException
from httpx import AsyncClient

from shared.auth import create_access_token, verify_token, get_current_user, require_role, get_password_hash, verify_password
from shared.config import settings
from shared.models import User
import uuid

def test_password_hashing():
    password = "supersecretpassword"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_create_and_verify_token():
    user_id = str(uuid.uuid4())
    tenant_id = str(uuid.uuid4())
    role = "admin"
    email = "admin@example.com"
    
    token = create_access_token(user_id, tenant_id, role, email)
    
    payload = verify_token(token)
    assert payload["sub"] == user_id
    assert payload["tenant_id"] == tenant_id
    assert payload["role"] == role
    assert payload["email"] == email

def test_expired_token():
    user_id = str(uuid.uuid4())
    tenant_id = str(uuid.uuid4())
    role = "admin"
    email = "admin@example.com"
    
    # Create manually an expired token
    expire = datetime.now(timezone.utc) - timedelta(minutes=10)
    to_encode = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "role": role,
        "email": email,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    with pytest.raises(HTTPException) as exc:
        verify_token(encoded_jwt)
    assert exc.value.status_code == 401
    assert "expired" in exc.value.detail.lower()

def test_invalid_token():
    with pytest.raises(HTTPException) as exc:
        verify_token("invalid.token.string")
    assert exc.value.status_code == 401

@pytest.mark.asyncio
async def test_require_role():
    user_with_admin = {"role": "admin"}
    checker = require_role("admin")
    
    # Should not raise
    await checker(user_with_admin)
    
    user_with_imam = {"role": "imam"}
    with pytest.raises(HTTPException) as exc:
        await checker(user_with_imam)
    assert exc.value.status_code == 403
