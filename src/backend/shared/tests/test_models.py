import pytest
import uuid
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import declarative_base
from shared.models import (
    Base, Tenant, User, KhutbaScript, KhutbaSegment,
    SegmentTranslation, Session, SessionEvent, VoiceProfile,
    QuranVerseCache, HadithCache, AuditLog
)
from shared.database import set_tenant_context

def test_models_have_tablenames():
    """Test that all models have __tablename__ defined."""
    models = [
        Tenant, User, KhutbaScript, KhutbaSegment,
        SegmentTranslation, Session, SessionEvent, VoiceProfile,
        QuranVerseCache, HadithCache, AuditLog
    ]
    for model in models:
        assert hasattr(model, "__tablename__")
        assert model.__tablename__ is not None

def test_tenant_scoped_models():
    """Test that tenant-scoped models have tenant_id column."""
    scoped_models = [
        User, KhutbaScript, Session, SessionEvent, VoiceProfile, AuditLog
    ]
    for model in scoped_models:
        assert hasattr(model, "tenant_id")

@pytest.mark.asyncio
async def test_set_tenant_context_invalid_uuid():
    """Test that UUID validation in set_tenant_context rejects invalid values."""
    class DummySession:
        async def execute(self, statement):
            pass

    dummy_session = DummySession()
    
    with pytest.raises(ValueError, match="Invalid tenant_id format"):
        await set_tenant_context(dummy_session, "not-a-uuid")
