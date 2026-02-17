import sqlite3
from datetime import datetime

conn = sqlite3.connect('rms.db')
cursor = conn.cursor()

print("Checking Sales for Store 1 (Delhi)...")
cursor.execute("SELECT COUNT(*) FROM sales WHERE store_id = 1")
count = cursor.fetchone()[0]
print(f"Total Sales for Store 1: {count}")

print("\nChecking Users...")
cursor.execute("SELECT id, email, role, store_id FROM users")
users = cursor.fetchall()
for u in users:
    print(u)

print("\nChecking Today's Sales for Store 1...")
today = datetime.now().strftime('%Y-%m-%d')
print(f"Querying for date: {today}")
cursor.execute("SELECT * FROM sales WHERE store_id = 1 AND date(sale_date) = ?", (today,))
today_sales = cursor.fetchall()
print(f"Sales found for today: {len(today_sales)}")

cursor.execute("SELECT sale_date FROM sales WHERE store_id = 1 ORDER BY sale_date DESC LIMIT 5")
print("\nLatest 5 Sales Dates:")
for row in cursor.fetchall():
    print(row[0])

conn.close()
