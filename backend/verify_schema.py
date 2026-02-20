import sys
import os
from sqlalchemy import text, inspect

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine
from app.core.config import settings

def verify_schema():
    print(f"Checking database at: {settings.DATABASE_URL}")
    inspector = inspect(engine)
    
    # Check campaigns table
    if not inspector.has_table("campaigns"):
        print("❌ Table 'campaigns' does not exist!")
        return
        
    columns = [c['name'] for c in inspector.get_columns('campaigns')]
    print(f"Columns in 'campaigns': {', '.join(columns)}")
    
    if 'revenue' in columns:
        print("[OK] Column 'revenue' exists in 'campaigns' table.")
    else:
        print("[FAIL] Column 'revenue' is MISSING in 'campaigns' table!")
        
    # Check system_settings table
    if inspector.has_table("system_settings"):
        print("[OK] Table 'system_settings' exists.")
    else:
        print("[FAIL] Table 'system_settings' is MISSING!")

if __name__ == "__main__":
    try:
        verify_schema()
    except Exception as e:
        print(f"Error: {e}")
