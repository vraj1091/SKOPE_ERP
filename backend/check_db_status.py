import sqlite3
import os

try:
    conn = sqlite3.connect('rms.db')
    cursor = conn.cursor()
    
    with open('db_status.txt', 'w') as f:
        f.write("DB STATUS CHECK\n")
        f.write("================\n")
        
        cursor.execute("SELECT count(*) FROM users")
        users = cursor.fetchone()[0]
        f.write(f"Users: {users}\n")
        
        cursor.execute("SELECT count(*) FROM sales")
        sales = cursor.fetchone()[0]
        f.write(f"Sales: {sales}\n")
        
        cursor.execute("SELECT * FROM sales ORDER BY id DESC LIMIT 1")
        last_sale = cursor.fetchone()
        f.write(f"Last Sale: {last_sale}\n")

    conn.close()
    print("DONE writing db_status.txt")
except Exception as e:
    with open('db_status.txt', 'w') as f:
        f.write(f"ERROR: {e}")
