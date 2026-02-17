
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.database import engine
from app.db import models

if __name__ == "__main__":
    print("Creating all database tables based on models...")
    try:
        models.Base.metadata.create_all(bind=engine)
        print("SUCCESS: All tables created successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create tables: {e}")
