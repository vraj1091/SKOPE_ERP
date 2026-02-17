import sqlite3
import sys

# Force flush
sys.stdout.reconfigure(encoding='utf-8')

print("Starting diagnostics...")

try:
    conn = sqlite3.connect("skope_erp.db")
    cursor = conn.cursor()

    print("\n--- ALL USERS ---")
    cursor.execute("SELECT id, email, role, store_id FROM users")
    users = cursor.fetchall()
    for u in users:
        print(f"User: {u}")
        
    print("\n--- CHECKING admin@store.com ---")
    cursor.execute("SELECT * FROM users WHERE email='admin@store.com'")
    target = cursor.fetchone()
    if target:
        print(f"FOUND TARGET: {target}")
    else:
        print("TARGET NOT FOUND! Creating it...")
        # Create user if missing
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        pw_hash = pwd_context.hash("admin123")
        
        # Get store 1
        cursor.execute("SELECT id FROM stores LIMIT 1")
        store_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO users (email, username, hashed_password, full_name, role, is_active, store_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, ('admin@store.com', 'admin_store', pw_hash, 'System Admin', 'super_admin', 1, store_id))
        conn.commit()
        print("Created admin@store.com as super_admin")

    conn.close()
    
except Exception as e:
    print(f"ERROR: {e}")
