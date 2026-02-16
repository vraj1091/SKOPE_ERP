from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path
import os

# Compute the absolute path to the backend directory
# config.py is at backend/app/core/config.py, so go up 3 levels to get to backend/
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_DB_PATH = _BACKEND_DIR / "skope_erp.db"

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{_DB_PATH.as_posix()}"
    SECRET_KEY: str = "your-secret-key-change-in-production-skope-erp-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    class Config:
        env_file = ".env"

settings = Settings()

# Print DB path for debugging on startup
print(f"[CONFIG] Database path: {_DB_PATH}")
print(f"[CONFIG] Database URL: {settings.DATABASE_URL}")
