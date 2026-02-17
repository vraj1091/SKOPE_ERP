import sqlite3
import os

files = ["skope_erp.db", "rms.db", "rms_new.db"]

for db_file in files:
    if os.path.exists(db_file):
        print(f"\n--- Checking {db_file} ---")
        try:
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"Tables: {[t[0] for t in tables]}")
            
            if ('campaigns',) in tables or ('campaign',) in tables:
                table_name = 'campaigns' if ('campaigns',) in tables else 'campaign'
                print(f"Found '{table_name}' table!")
                cursor.execute(f"SELECT count(*) FROM {table_name}")
                count = cursor.fetchone()[0]
                print(f"Row count in '{table_name}': {count}")
            else:
                print("No 'campaigns' table found.")
                
            conn.close()
        except Exception as e:
            print(f"Error reading {db_file}: {e}")
    else:
        print(f"\n{db_file} does not exist.")
