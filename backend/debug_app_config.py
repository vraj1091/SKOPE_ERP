import sys
import os

# Add the project root to sys.path so we can import app modules
sys.path.append(os.getcwd())

from app.core.config import settings
from app.db.database import SessionLocal
from app.db import models
from sqlalchemy import text

print(f"DEBUG: Configured Database URL: {settings.DATABASE_URL}")

try:
    db = SessionLocal()
    print("DEBUG: Session checking...")
    
    # Check 1: Raw SQL execution (bypassing models)
    try:
        result = db.execute(text("SELECT count(*) FROM products")).scalar()
        print(f"DEBUG: Raw SQL Count Products: {result}")
    except Exception as e:
        print(f"DEBUG: Raw SQL Failed: {e}")

    # Check 2: ORM Count
    try:
        count = db.query(models.Product).count()
        print(f"DEBUG: ORM Count Products: {count}")
    except Exception as e:
        print(f"DEBUG: ORM Failed: {e}")
        
    # Check 3: Users
    try:
        user_count = db.query(models.User).count()
        print(f"DEBUG: User Count: {user_count}")
    except Exception as e:
        print(f"DEBUG: User Check Failed: {e}")
        
    db.close()

except Exception as e:
    print(f"DEBUG: Critical Connection Error: {e}")
