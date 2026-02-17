import sqlite3
import os
from datetime import datetime

def check_db(db_name):
    print(f"\n{'='*50}")
    print(f"Checking database: {db_name}")
    print(f"{'='*50}")
    
    if not os.path.exists(db_name):
        print(f"❌ Database file '{db_name}' not found.")
        return

    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # 1. List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"✅ Connection successful!")
        print(f"📁 Found {len(tables)} tables: {', '.join(tables)}")
        
        # 2. Check campaigns table
        if 'campaigns' in tables:
            print("\n📊 Checking 'campaigns' table:")
            cursor.execute("SELECT count(*) FROM campaigns")
            count = cursor.fetchone()[0]
            print(f"   - Total campaigns: {count}")
            
            if count > 0:
                print("\n   Last 5 campaigns:")
                cursor.execute("SELECT id, name, campaign_type, status, created_at FROM campaigns ORDER BY id DESC LIMIT 5")
                rows = cursor.fetchall()
                print(f"   {'ID':<5} {'Name':<30} {'Type':<15} {'Status':<15} {'Created At'}")
                print(f"   {'-'*5} {'-'*30} {'-'*15} {'-'*15} {'-'*20}")
                for r in rows:
                    created_at = r[4] if r[4] else "N/A"
                    print(f"   {r[0]:<5} {r[1][:28]:<30} {r[2]:<15} {r[3]:<15} {created_at}")
        else:
            print("\n❌ 'campaigns' table NOT found in this database.")
            
        conn.close()

    except Exception as e:
        print(f"❌ Error reading database: {e}")

if __name__ == "__main__":
    # Check the main database configured in config.py
    check_db("skope_erp.db")
    
    # Also check rms.db just in case, as it seems to be an older one
    check_db("rms.db")
