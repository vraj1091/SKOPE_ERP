
import sys
import traceback

try:
    print("Testing imports...")
    import fastapi
    import uvicorn
    import sqlalchemy
    import pydantic
    from pydantic import BaseModel
    import httpx
    import passlib
    from passlib.context import CryptContext
    import jose
    from jose import jwt
    
    print("Testing app imports...")
    from app.core.config import settings
    from app.core.security import verify_password, get_password_hash, create_access_token
    from app.db.database import get_db, Base
    from app.db import models
    from app.schemas.user import UserLogin, Token, UserResponse
    from app.api.v1 import auth, chatbot
    
    print("All imports successful!")
    
except Exception as e:
    print("IMPORT ERROR:")
    traceback.print_exc()
    sys.exit(1)
