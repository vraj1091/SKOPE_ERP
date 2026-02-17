import sys
import os
import requests
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def check_backend_health():
    print_section("BACKEND HEALTH CHECK")
    
    try:
        # Check if backend is running
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend is RUNNING")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Backend is NOT RUNNING (Connection refused)")
        print("  Please start the backend server first")
        return False
    except Exception as e:
        print(f"✗ Error checking backend: {e}")
        return False
    
    # Check API root
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"✓ API Root accessible: {response.json()}")
    except Exception as e:
        print(f"✗ API Root error: {e}")
    
    # Check API docs
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✓ API Documentation is accessible")
    except Exception as e:
        print(f"✗ API Docs error: {e}")
    
    return True

def check_database():
    print_section("DATABASE CHECK")
    
    try:
        from app.db.database import SessionLocal, engine
        from app.db import models
        from sqlalchemy import inspect
        
        # Check connection
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"✓ Database connected")
        print(f"  Found {len(tables)} tables: {', '.join(tables)}")
        
        # Check required tables
        required_tables = ['users', 'stores', 'audit_logs', 'products', 'sales']
        missing = [t for t in required_tables if t not in tables]
        if missing:
            print(f"✗ Missing tables: {', '.join(missing)}")
            print("  Run: python setup_complete_database.py --reset")
            return False
        else:
            print("✓ All required tables exist")
        
        # Check admin user
        db = SessionLocal()
        try:
            admin = db.query(models.User).filter(
                models.User.email == "admin@store.com"
            ).first()
            
            if admin:
                print(f"✓ Admin user exists")
                print(f"  ID: {admin.id}")
                print(f"  Email: {admin.email}")
                print(f"  Role: {admin.role}")
                print(f"  Active: {admin.is_active}")
                
                # Verify password
                from app.core.security import verify_password
                if verify_password("admin123", admin.hashed_password):
                    print("✓ Admin password is correct (admin123)")
                else:
                    print("✗ Admin password verification failed")
                    print("  Resetting password...")
                    from app.core.security import get_password_hash
                    admin.hashed_password = get_password_hash("admin123")
                    db.commit()
                    print("✓ Password reset to 'admin123'")
            else:
                print("✗ Admin user NOT FOUND")
                print("  Restart backend to trigger user creation")
                return False
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"✗ Database error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

def check_auth_endpoint():
    print_section("AUTHENTICATION ENDPOINT CHECK")
    
    try:
        # Test login endpoint
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json={
                "username": "admin@store.com",
                "password": "admin123"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Login endpoint is WORKING")
            print(f"  Token received: {data.get('access_token', 'N/A')[:50]}...")
            print(f"  User: {data.get('user', {}).get('email', 'N/A')}")
            return True
        else:
            print(f"✗ Login failed with status {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Login endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_frontend():
    print_section("FRONTEND CHECK")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✓ Frontend is RUNNING")
        else:
            print(f"✗ Frontend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Frontend is NOT RUNNING")
        print("  Please start the frontend server")
        return False
    except Exception as e:
        print(f"✗ Frontend error: {e}")
        return False
    
    return True

def check_cors():
    print_section("CORS CONFIGURATION CHECK")
    
    try:
        # Test CORS with OPTIONS request
        response = requests.options(
            "http://localhost:8000/api/v1/auth/login",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=5
        )
        
        cors_headers = {
            k: v for k, v in response.headers.items() 
            if k.lower().startswith('access-control')
        }
        
        if cors_headers:
            print("✓ CORS is configured")
            for header, value in cors_headers.items():
                print(f"  {header}: {value}")
        else:
            print("✗ CORS headers not found")
            return False
            
    except Exception as e:
        print(f"✗ CORS check error: {e}")
        return False
    
    return True

def main():
    print("\n" + "="*60)
    print("  SKOPE ERP - COMPREHENSIVE DIAGNOSTIC TOOL")
    print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("="*60)
    
    results = {
        "backend_health": check_backend_health(),
        "database": check_database(),
        "auth_endpoint": check_auth_endpoint(),
        "cors": check_cors(),
        "frontend": check_frontend(),
    }
    
    print_section("SUMMARY")
    
    all_passed = all(results.values())
    
    for check, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status} - {check.replace('_', ' ').title()}")
    
    print("\n" + "="*60)
    if all_passed:
        print("  ✓ ALL CHECKS PASSED - SYSTEM IS HEALTHY")
        print("="*60)
        print("\nYou can now access:")
        print("  Frontend: http://localhost:3000")
        print("  Backend API: http://localhost:8000/docs")
        print("\nDemo Credentials:")
        print("  Email: admin@store.com")
        print("  Password: admin123")
    else:
        print("  ✗ SOME CHECKS FAILED - PLEASE FIX THE ISSUES ABOVE")
        print("="*60)
        print("\nRecommended Actions:")
        if not results["backend_health"]:
            print("  1. Start backend: cd backend && venv\\Scripts\\activate && python -m uvicorn app.main:app --reload")
        if not results["database"]:
            print("  2. Reset database: cd backend && python setup_complete_database.py --reset")
        if not results["frontend"]:
            print("  3. Start frontend: cd frontend && npm run dev")
    
    print("\n")

if __name__ == "__main__":
    main()
