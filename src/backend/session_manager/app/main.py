from fastapi import FastAPI
from shared.logging import setup_logging
from shared.config import settings

setup_logging()

app = FastAPI(title=settings.SERVICE_NAME or "session_manager")

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "session_manager"}
