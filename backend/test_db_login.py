
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.db.models import User
from app.core.security import verify_password

db = SessionLocal()

# Test direct DB connection and login
user = db.query(User).filter(User.email == "admin@store.com").first()
if user:
    print(f"Found user: {user.username}")
    print(f"ID: {user.id}")
    print(f"Is Active: {user.is_active}")
    print(f"Role: {user.role}")
    print(f"Store ID: {user.store_id}")
    print(f"Hash: {user.hashed_password[:50]}...")
    
    # Test password verification
    test_password = "admin123"
    result = verify_password(test_password, user.hashed_password)
    print(f"Password 'admin123' verification: {result}")
else:
    print("User not found!")

db.close()
