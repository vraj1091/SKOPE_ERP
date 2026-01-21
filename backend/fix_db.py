
import os
import sys
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.db import models
from app.core.security import get_password_hash

# 1. Force remove/move old DB
db_file = "rms.db"
if os.path.exists(db_file):
    try:
        os.remove(db_file)
        print("SUCCESS: Deleted old rms.db")
    except PermissionError:
        print("ERROR: Could not delete rms.db - IT IS LOCKED BY ANOTHER PROCESS.")
        print("Please KILL all python/uvicorn processes via Task Manager.")
        sys.exit(1)
    except Exception as e:
        print(f"Error removing file: {e}")
        sys.exit(1)

# 2. Setup New DB
database_url = "sqlite:///./rms.db"
engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

print("Creating tables...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    print("Creating Admin User...")
    admin = models.User(
        email="admin@example.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        full_name="System Administrator",
        role=models.UserRole.SUPER_ADMIN,
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("SUCCESS: Admin user created.")
    print("Login with: admin@example.com / admin123")
except Exception as e:
    print(f"FAILED to create user: {e}")
    db.rollback()
finally:
    db.close()
