from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/db"
    REDIS_URL: str = "redis://localhost:6379/0"
    MINIO_URL: str = "http://localhost:9000"
    SERVICE_NAME: str = "unknown_service"
    LOG_LEVEL: str = "INFO"
    JWT_SECRET: str = "supersecret_default_key_change_in_prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
