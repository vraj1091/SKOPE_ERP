from app.db.database import SessionLocal
from app.db import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}, Role: {u.role}")
except Exception as e:
    print(f"Error querying users: {e}")
finally:
    db.close()
