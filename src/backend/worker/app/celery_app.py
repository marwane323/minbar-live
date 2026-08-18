from celery import Celery
from shared.config import settings
from shared.logging import setup_logging

setup_logging()

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

@celery_app.task(name="health_check")
def health_check() -> dict:
    return {"status": "ok", "service": settings.SERVICE_NAME or "worker"}
