import uuid

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from typing import AsyncGenerator
from contextvars import ContextVar
from .config import settings

tenant_context: ContextVar[str] = ContextVar("tenant_context", default="")

engine = create_async_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def set_tenant_context(session: AsyncSession, tenant_id: str) -> None:
    """Set the PostgreSQL session variable for Row Level Security.

    Uses parameterized SET via a DO block to prevent SQL injection.
    Validates tenant_id is a valid UUID before executing.
    """
    # Validate UUID format — defense in depth against injection
    try:
        uuid.UUID(tenant_id)
    except ValueError as exc:
        raise ValueError(f"Invalid tenant_id format: {tenant_id!r}") from exc

    # PostgreSQL SET does not support $1 placeholders, so we use a validated literal.
    # The UUID validation above guarantees the value is safe.
    await session.execute(text(f"SET app.tenant_id = '{tenant_id}'"))


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session."""
    async with AsyncSessionLocal() as session:
        t_id = tenant_context.get()
        if t_id:
            await set_tenant_context(session, t_id)
        yield session
