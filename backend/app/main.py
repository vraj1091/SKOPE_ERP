import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import auth, inventory, sales, customers, financial, reports, users, campaigns, marketing, stores, chatbot
from app.core.config import settings
from app.db.database import engine
from app.db import models
import os

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SKOPE ERP API",
    description="A comprehensive SaaS platform for retail operations with Marketing Automation",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Create upload directories
os.makedirs("backend/uploads/creative_assets", exist_ok=True)
os.makedirs("backend/uploads/vouchers", exist_ok=True)

# Mount static files for uploads
if os.path.exists("backend/uploads"):
    app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(stores.router, prefix="/api/v1/stores", tags=["Stores"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])
app.include_router(financial.router, prefix="/api/v1/financial", tags=["Financial"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(campaigns.router, prefix="/api/v1/campaigns", tags=["Marketing Campaigns"])
app.include_router(marketing.router, prefix="/api/v1/marketing", tags=["Marketing Integrations"])
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["AI Chatbot"])

from app.api.dependencies import get_db
from app.db.database import SessionLocal
from app.core.security import get_password_hash
from app.db.models import User, Store, UserRole

# ... imports ...

@app.on_event("startup")
def startup_db_client():
    db = SessionLocal()
    try:
        # Create Default Store
        store = db.query(Store).filter(Store.email == "info@store.com").first()
        if not store:
            store = Store(
                name="SKOPE Retail Store",
                address="123 Main St, City",
                phone="9876543210",
                email="info@store.com",
                gst_number="GST123456789",
                is_active=True
            )
            db.add(store)
            db.commit()
            db.refresh(store)
            print("Created default store")

        # Create Admin User
        admin = db.query(User).filter(User.email == "admin@store.com").first()
        if not admin:
            admin = User(
                email="admin@store.com",
                username="admin@store.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Admin",
                role=UserRole.SUPER_ADMIN,
                store_id=store.id,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Created admin user")
        else:
             # Reset password ensuring it matches
             admin.hashed_password = get_password_hash("admin123")
             admin.store_id = store.id
             admin.is_active = True
             db.add(admin)
             db.commit()
             print("Reset admin user password")

        # Create Manager User
        manager = db.query(User).filter(User.email == "manager@store.com").first()
        if not manager:
            manager = User(
                email="manager@store.com",
                username="manager@store.com",
                hashed_password=get_password_hash("manager123"),
                full_name="Store Manager",
                role=UserRole.STORE_MANAGER,
                store_id=store.id,
                is_active=True
            )
            db.add(manager)
            db.commit()
            print("Created manager user")
        else:
             manager.hashed_password = get_password_hash("manager123")
             manager.store_id = store.id
             manager.is_active = True
             db.add(manager)
             db.commit()
             print("Reset manager user password")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "SKOPE ERP API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
