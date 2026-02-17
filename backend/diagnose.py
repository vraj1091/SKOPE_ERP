
import sys
import os
import traceback

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import inspect, text
from app.db.database import engine, SessionLocal
from app.db import models
from app.core.security import verify_password, get_password_hash

def diagnose():
    print("=== SKOPE ERP DIAGNOSTIC TOOL ===")
    
    # 1. Check Database Connection
    print("\n[1] Checking Database Connection...")
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"SUCCESS: Connected to Database. Found {len(tables)} tables.")
        print(f"Tables: {', '.join(tables)}")
        
        required_tables = ['users', 'stores', 'audit_logs']
        missing = [t for t in required_tables if t not in tables]
        if missing:
            print(f"CRITICAL ERROR: Missing tables: {missing}")
            print("Run RESET_DATABASE.bat to fix this.")
        else:
            print("Core tables present.")

    except Exception as e:
        print(f"FAIL: Database connection error: {e}")
        traceback.print_exc()
        return

    # 2. Check Admin User
    print("\n[2] Checking Admin User...")
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == "admin@store.com").first()
        if not user:
            print("FAIL: Admin user 'admin@store.com' NOT FOUND.")
            print("Restart the backend to trigger seeding.")
        else:
            print(f"SUCCESS: Found Admin User (ID: {user.id})")
            print(f"Role: {user.role}")
            print(f"Active: {user.is_active}")
            
            # 3. Verify Password
            print("\n[3] Verifying Password...")
            is_valid = verify_password("admin123", user.hashed_password)
            if is_valid:
                print("SUCCESS: Password 'admin123' is valid.")
            else:
                print("FAIL: Password 'admin123' is INVALID.")
                print("Resetting password now...")
                user.hashed_password = get_password_hash("admin123")
                db.commit()
                print("Password reset to 'admin123'.")

    except Exception as e:
        print(f"FAIL: Error checking user: {e}")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    with open("diagnostic_report.txt", "w") as f:
        sys.stdout = f
        sys.stderr = f
        diagnose()
