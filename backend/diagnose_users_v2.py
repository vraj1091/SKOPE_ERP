import sqlite3
import pandas as pd

try:
    conn = sqlite3.connect("skope_erp.db")
    cursor = conn.cursor()

    print("\n--- USERS ---")
    cursor.execute("SELECT id, email, role, store_id FROM users")
    users = cursor.fetchall()
    for u in users:
        print(u)

    print("\n--- STORES ---")
    cursor.execute("SELECT id, name FROM stores")
    stores = cursor.fetchall()
    for s in stores:
        print(s)

    print("\n--- PRODUCT COUNTS PER STORE ---")
    cursor.execute("SELECT store_id, count(*) FROM products GROUP BY store_id")
    counts = cursor.fetchall()
    for c in counts:
        print(f"Store {c[0]}: {c[1]} products")
    
    conn.close()
except Exception as e:
    print(e)
