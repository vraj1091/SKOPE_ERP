import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine
from app.db import models
from app.core.security import get_password_hash
from app.db.models import UserRole

def init_db():
    db = SessionLocal()
    
    try:
        # Create Store
        store = db.query(models.Store).filter(models.Store.email == "info@store.com").first()
        if not store:
            store = models.Store(
                name="SKOPE Retail Store",
                address="123 Main St, City",
                phone="9876543210",
                email="info@store.com",
                is_active=True
            )
            db.add(store)
            db.commit()
            db.refresh(store)
            print("Created default store")
        
        # Create Admin
        admin = db.query(models.User).filter(models.User.email == "admin@store.com").first()
        if not admin:
            admin = models.User(
                email="admin@store.com",
                username="admin@store.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Admin",
                role=UserRole.SUPER_ADMIN,
                store_id=store.id,
                is_active=True
            )
            db.add(admin)
            print("Created admin user")
        else:
            print("Admin user already exists")
            # Reset password to ensure it matches what's displayed
            admin.hashed_password = get_password_hash("admin123")
            db.add(admin)
            print("Reset admin password to 'admin123'")


        # Create Manager
        manager = db.query(models.User).filter(models.User.email == "manager@store.com").first()
        if not manager:
            manager = models.User(
                email="manager@store.com",
                username="manager@store.com",
                hashed_password=get_password_hash("manager123"),
                full_name="Store Manager",
                role=UserRole.STORE_MANAGER,
                store_id=store.id,
                is_active=True
            )
            db.add(manager)
            print("Created manager user")
        else:
             print("Manager user already exists")
             # Reset password
             manager.hashed_password = get_password_hash("manager123")
             db.add(manager)
             print("Reset manager password to 'manager123'")

        db.commit()

    except Exception as e:
        print(f"Error initializing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating initial data...")
    init_db()
    print("Done!")
