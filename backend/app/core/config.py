from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path
import os

# Compute the absolute path to the backend directory
# config.py is at backend/app/core/config.py, so go up 3 levels to get to backend/
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_DB_PATH = _BACKEND_DIR / "skope_erp.db"

class Settings(BaseSettings):
    # Database URL - use environment variable if available (for Render), otherwise use local path
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_DB_PATH.as_posix()}")
    
    # Security settings - use environment variables in production
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-skope-erp-2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS settings - allow all origins for now (can be restricted in production)
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()

# Print DB path for debugging on startup
print(f"[CONFIG] Environment: {'PRODUCTION' if os.getenv('RENDER') else 'DEVELOPMENT'}")
print(f"[CONFIG] Database URL: {settings.DATABASE_URL}")
if not os.getenv("RENDER"):
    print(f"[CONFIG] Local Database path: {_DB_PATH}")

