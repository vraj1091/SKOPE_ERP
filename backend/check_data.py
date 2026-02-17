import sqlite3
import sys

db_path = "rms.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"Checking data in {db_path}...")
    
    tables = ["users", "stores", "products", "customers", "sales", "expenses", "marketing_integrations"]
    
    total_rows = 0
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"{table}: {count}")
            total_rows += count
        except sqlite3.OperationalError:
            print(f"{table}: TABLE MISSING")
            
    print(f"\nTotal rows across key tables: {total_rows}")
    
    if total_rows == 0:
        print("DATABASE IS EMPTY!")
    else:
        print("Database has data.")

    conn.close()

except Exception as e:
    print(f"Error: {e}")
