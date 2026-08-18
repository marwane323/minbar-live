import os

base_dir = r"C:\Projects\Khutba\minbar-live\src\backend"
services = {
    "api_gateway": 8000,
    "asr_service": 8001,
    "alignment_service": 8002,
    "translation_service": 8003,
    "tts_service": 8004,
    "quran_service": 8005,
    "websocket_hub": 8006,
    "session_manager": 8007,
}

pyproject_template = """[project]
name = "{service_name}"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.100",
    "uvicorn>=0.23",
    "shared",
]
"""

dockerfile_template = """FROM python:3.11-slim
WORKDIR /app
COPY src/backend/shared /app/shared
COPY src/backend/{service_name} /app/service
RUN pip install --no-cache-dir /app/shared /app/service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "{port}"]
"""

main_template = """from fastapi import FastAPI
from shared.logging import setup_logging
from shared.config import settings

setup_logging()

app = FastAPI(title=settings.SERVICE_NAME or "{service_name}")

@app.get("/health")
async def health_check() -> dict:
    return {{"status": "ok", "service": "{service_name}"}}
"""

for svc, port in services.items():
    svc_dir = os.path.join(base_dir, svc)
    app_dir = os.path.join(svc_dir, "app")
    os.makedirs(app_dir, exist_ok=True)
    
    with open(os.path.join(svc_dir, "pyproject.toml"), "w") as f:
        f.write(pyproject_template.format(service_name=svc))
        
    with open(os.path.join(svc_dir, "Dockerfile"), "w") as f:
        f.write(dockerfile_template.format(service_name=svc, port=port))
        
    with open(os.path.join(app_dir, "__init__.py"), "w") as f:
        f.write("# App module\\n")
        
    with open(os.path.join(app_dir, "main.py"), "w") as f:
        f.write(main_template.format(service_name=svc))

# Worker service
worker_dir = os.path.join(base_dir, "worker")
worker_app_dir = os.path.join(worker_dir, "app")
os.makedirs(worker_app_dir, exist_ok=True)

worker_pyproject = """[project]
name = "worker"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "celery>=5.3",
    "redis>=5.0",
    "shared",
]
"""

worker_dockerfile = """FROM python:3.11-slim
WORKDIR /app
COPY src/backend/shared /app/shared
COPY src/backend/worker /app/service
RUN pip install --no-cache-dir /app/shared /app/service celery redis
CMD ["celery", "-A", "app.celery_app:celery_app", "worker", "--loglevel=info"]
"""

worker_celery_app = """from celery import Celery
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
    return {{"status": "ok", "service": settings.SERVICE_NAME or "worker"}}
"""

with open(os.path.join(worker_dir, "pyproject.toml"), "w") as f:
    f.write(worker_pyproject)
    
with open(os.path.join(worker_dir, "Dockerfile"), "w") as f:
    f.write(worker_dockerfile)
    
with open(os.path.join(worker_app_dir, "__init__.py"), "w") as f:
    f.write("# Celery app module\\n")
    
with open(os.path.join(worker_app_dir, "celery_app.py"), "w") as f:
    f.write(worker_celery_app)

print("Scaffolding complete!")
