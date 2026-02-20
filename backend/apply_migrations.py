import sys
import os
from sqlalchemy import text, inspect

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine, SessionLocal
from app.db.models import Base, SystemSetting

def upgrade_db():
    print("Checking database schema...")
    inspector = inspect(engine)
    
    # 1. Check for 'revenue' column in 'campaigns'
    columns = [c['name'] for c in inspector.get_columns('campaigns')]
    if 'revenue' not in columns:
        print("Adding 'revenue' column to 'campaigns' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE campaigns ADD COLUMN revenue FLOAT DEFAULT 0.0"))
            conn.commit()
        print("[OK] Column 'revenue' added.")
    else:
        print("[OK] Column 'revenue' already exists.")
        
    # 2. Check for 'system_settings' table
    if not inspector.has_table("system_settings"):
        print("Creating 'system_settings' table...")
        # We can use create_all, but restricted to the specific table if possible,
        # or just run create_all which skips existing tables
        Base.metadata.create_all(bind=engine)
        print("[OK] Table 'system_settings' created.")
    else:
        print("[OK] Table 'system_settings' already exists.")

if __name__ == "__main__":
    try:
        upgrade_db()
        print("\nDatabase upgrade completed successfully!")
    except Exception as e:
        print(f"\n[ERROR] Error upgrading database: {str(e)}")
