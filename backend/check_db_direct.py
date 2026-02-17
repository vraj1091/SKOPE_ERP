import sqlite3
import sys
sys.path.insert(0, ".")

# Direct SQLite check
conn = sqlite3.connect("rms.db")
cursor = conn.cursor()

print("Tables in database:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for t in tables:
    print(f"  - {t[0]}")

print("\nUsers in database:")
cursor.execute("SELECT id, email, username, role, is_active FROM users LIMIT 5;")
users = cursor.fetchall()
for u in users:
    print(f"  ID={u[0]}, Email={u[1]}, Username={u[2]}, Role={u[3]}, Active={u[4]}")

# Check admin password hash
cursor.execute("SELECT hashed_password FROM users WHERE email='admin@store.com';")
result = cursor.fetchone()
if result:
    print(f"\nAdmin password hash: {result[0][:50]}...")
else:
    print("\nAdmin user NOT FOUND!")

conn.close()

# Test password verification
print("\n\nTesting passlib bcrypt...")
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create a new hash and verify
test_hash = pwd_context.hash("admin123")
print(f"New hash for 'admin123': {test_hash[:50]}...")
verified = pwd_context.verify("admin123", test_hash)
print(f"Verification of new hash: {verified}")
