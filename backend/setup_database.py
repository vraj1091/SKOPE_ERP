import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing imports...")
try:
    from app.core.config import settings
    print(f"Database URL: {settings.DATABASE_URL}")
    
    from app.db.database import engine, SessionLocal
    print("Database engine created")
    
    from app.db import models
    print("Models imported")
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    print("Tables created")
    
    # Test DB connection
    db = SessionLocal()
    from app.core.security import get_password_hash, verify_password
    
    # Ensure admin user exists
    admin = db.query(models.User).filter(models.User.email == "admin@store.com").first()
    if not admin:
        print("Admin not found, creating...")
        store = db.query(models.Store).first()
        if not store:
            store = models.Store(
                name="SKOPE Store",
                address="123 Main St",
                phone="1234567890",
                email="info@store.com",
                is_active=True
            )
            db.add(store)
            db.commit()
            db.refresh(store)
            print(f"Created store ID: {store.id}")
        
        admin = models.User(
            email="admin@store.com",
            username="admin@store.com",
            hashed_password=get_password_hash("admin123"),
            full_name="System Admin",
            role=models.UserRole.SUPER_ADMIN,
            store_id=store.id,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Created admin user")
    else:
        print(f"Admin found: {admin.id}")
        # Reset password
        admin.hashed_password = get_password_hash("admin123")
        admin.is_active = True
        db.commit()
        print("Reset admin password")
    
    # Verify password works
    admin = db.query(models.User).filter(models.User.email == "admin@store.com").first()
    result = verify_password("admin123", admin.hashed_password)
    print(f"Password verification: {result}")
    
    db.close()
    print("\nAll checks passed! Backend should work now.")
    
except Exception as e:
    import traceback
    print(f"ERROR: {e}")
    traceback.print_exc()
