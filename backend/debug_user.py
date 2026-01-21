
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Ensure we are looking at the same DB
db_path = "rms.db"
print(f"Checking database at: {os.path.abspath(db_path)}")

if not os.path.exists(db_path):
    print("ERROR: rms.db file NOT FOUND!")
    sys.exit(1)

database_url = f"sqlite:///{db_path}"
engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    print("Querying users table...")
    result = db.execute(text("SELECT id, username, email, role, is_active FROM users"))
    users = result.fetchall()
    
    if not users:
        print("NO USERS FOUND IN DATABASE!")
    else:
        print(f"Found {len(users)} users:")
        for user in users:
            print(f" - ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}, IsActive: {user.is_active}")

    # Check specific admin user
    admin = db.execute(text("SELECT * FROM users WHERE email='admin@example.com'")).first()
    if admin:
        print(f"\nAdmin user found! ID: {admin.id}")
        # We can't easily verify the hash here without the context, but existence is step 1.
    else:
        print("\nAdmin user 'admin@example.com' NOT FOUND.")

except Exception as e:
    print(f"Error reading database: {e}")
finally:
    db.close()
