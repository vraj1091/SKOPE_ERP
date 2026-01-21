import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.database import SessionLocal
from app.db import models

try:
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.email == "admin@store.com").first()
    with open("user_status.txt", "w") as f:
        if user:
            f.write(f"User found: {user.email}")
        else:
            f.write("User NOT found")
    db.close()
except Exception as e:
    with open("user_status.txt", "w") as f:
        f.write(f"Error: {e}")
