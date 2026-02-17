import sqlite3
import sys

db_path = "rms.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    with open("schema_status.txt", "w") as f:
        f.write(f"Checking {db_path}...\n")
        
        # List tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        table_names = [t[0] for t in tables]
        f.write(f"Tables found: {table_names}\n")
        
        if "marketing_integrations" in table_names:
            f.write("\nColumns in marketing_integrations:\n")
            cursor.execute("PRAGMA table_info(marketing_integrations);")
            columns = cursor.fetchall()
            for col in columns:
                f.write(str(col) + "\n")
        else:
            f.write("\nmarketing_integrations table NOT found!\n")

        if "marketing_campaign_syncs" in table_names:
            f.write("\nColumns in marketing_campaign_syncs:\n")
            cursor.execute("PRAGMA table_info(marketing_campaign_syncs);")
            columns = cursor.fetchall()
            for col in columns:
                f.write(str(col) + "\n")
        else:
            f.write("\nmarketing_campaign_syncs table NOT found!\n")

    conn.close()

except Exception as e:
    with open("schema_status.txt", "w") as f:
        f.write(f"Error: {e}")
