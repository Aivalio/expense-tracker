"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from the .env file"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # App
    APP_NAME: str = "Expense Tracker API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "dev-secret-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/expense_tracker"

    # CORS (Frontend URLs)
    CORS_ORIGIN: str = "http://localhost:5500,http://127.0.0.1:5500"


# Singleton
settings = Settings()

