
import sys
import os
# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.database import engine, SessionLocal
from app.db import models
from app.core.security import get_password_hash

def force_reset():
    print("=== FORCE RESETTING ADMIN USER ===")
    
    # 1. Create Tables
    print("[1] Creating/Updating Tables...")
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Tables created.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        return

    db = SessionLocal()
    try:
        # 2. Check/Create Store
        print("[2] Checking Default Store...")
        store = db.query(models.Store).filter(models.Store.email == "info@store.com").first()
        if not store:
            print("Creating default store...")
            store = models.Store(
                name="SKOPE Retail Store",
                address="123 Main St",
                phone="9876543210",
                email="info@store.com",
                gst_number="GST123",
                is_active=True
            )
            db.add(store)
            db.commit()
            db.refresh(store)
        
        # 3. Upsert Admin
        print("[3] Upserting Admin User 'admin@store.com'...")
        admin = db.query(models.User).filter(models.User.email == "admin@store.com").first()
        
        hashed_pwd = get_password_hash("admin123")
        
        if admin:
            print("User exists. Updating password...")
            admin.hashed_password = hashed_pwd
            admin.is_active = True
            admin.store_id = store.id
            # admin.role = models.UserRole.SUPER_ADMIN # Ensure role is correct if enum allows
        else:
            print("User does not exist. Creating new...")
            admin = models.User(
                email="admin@store.com",
                username="admin@store.com",
                hashed_password=hashed_pwd,
                full_name="System Admin",
                role=models.UserRole.SUPER_ADMIN,
                store_id=store.id,
                is_active=True
            )
            db.add(admin)
        
        db.commit()
        print("SUCCESS: Admin user 'admin@store.com' / 'admin123' is ready.")
        
    except Exception as e:
        print(f"ERROR during reset: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    force_reset()
