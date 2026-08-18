from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any

from shared.logging import setup_logging
from shared.config import settings
from shared.database import get_db
from shared.models import User
from shared.auth import (
    verify_password,
    create_access_token,
    get_current_user,
    verify_token
)
from shared.middleware import TenantAuthMiddleware
import logging

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.SERVICE_NAME or "api_gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TenantAuthMiddleware)

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "api_gateway"}

@app.post("/api/auth/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(form_data.password, user.password_hash):
        logger.warning({"event": "login_failed", "email": form_data.username})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        logger.warning({"event": "login_failed_inactive", "email": form_data.username})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    logger.info({"event": "login_success", "user_id": str(user.id), "tenant_id": str(user.tenant_id)})
    
    access_token = create_access_token(
        user_id=str(user.id),
        tenant_id=str(user.tenant_id),
        role=user.role,
        email=user.email
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/refresh")
async def refresh_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = auth_header.split(" ")[1]
    try:
        payload = verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    access_token = create_access_token(
        user_id=payload["sub"],
        tenant_id=payload["tenant_id"],
        role=payload["role"],
        email=payload["email"]
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user
