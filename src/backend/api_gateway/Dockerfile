FROM python:3.11-slim
WORKDIR /app
COPY src/backend/shared /app/shared
COPY src/backend/api_gateway /app/service
RUN pip install --no-cache-dir /app/shared /app/service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
