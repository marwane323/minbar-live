import pytest
import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from shared.database import AsyncSessionLocal, set_tenant_context
from shared.models import Tenant, User

@pytest.mark.asyncio
async def test_tenant_context_isolation():
    # This test assumes a running test database where RLS policies are applied.
    # It tests whether set_tenant_context appropriately scopes queries.
    
    tenant_a_id = str(uuid.uuid4())
    tenant_b_id = str(uuid.uuid4())
    
    async with AsyncSessionLocal() as session:
        # We simulate creating contexts
        await set_tenant_context(session, tenant_a_id)
        
        # Verify context is set
        result = await session.execute(text("SELECT current_setting('app.tenant_id', true)"))
        setting = result.scalar()
        assert setting == tenant_a_id
        
        # Switch to tenant B
        await set_tenant_context(session, tenant_b_id)
        result = await session.execute(text("SELECT current_setting('app.tenant_id', true)"))
        setting = result.scalar()
        assert setting == tenant_b_id

@pytest.mark.asyncio
async def test_set_tenant_context_invalid_uuid():
    async with AsyncSessionLocal() as session:
        with pytest.raises(ValueError):
            await set_tenant_context(session, "not-a-uuid")
            
        with pytest.raises(ValueError):
            await set_tenant_context(session, "1234; DROP TABLE users;")
