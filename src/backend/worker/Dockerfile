FROM python:3.11-slim
WORKDIR /app
COPY src/backend/shared /app/shared
COPY src/backend/worker /app/service
RUN pip install --no-cache-dir /app/shared /app/service celery redis
CMD ["celery", "-A", "app.celery_app:celery_app", "worker", "--loglevel=info"]
