import sqlite3
import pandas as pd

conn = sqlite3.connect("skope_erp.db")
cursor = conn.cursor()

print("--- USERS ---")
cursor.execute("SELECT id, email, username, role, store_id FROM users")
users = cursor.fetchall()
for u in users:
    print(f"ID: {u[0]}, Email: {u[1]}, Role: {u[2]}, StoreID: {u[4]}")

print("\n--- STORES ---")
cursor.execute("SELECT id, name FROM stores")
stores = cursor.fetchall()
for s in stores:
    print(f"ID: {s[0]}, Name: {s[1]}")

print("\n--- PRODUCT COUNTS PER STORE ---")
cursor.execute("SELECT store_id, count(*) FROM products GROUP BY store_id")
counts = cursor.fetchall()
for c in counts:
    print(f"Store {c[0]}: {c[1]} products")

conn.close()
