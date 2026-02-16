"""
=============================================================
SKOPE ERP - Complete Database Setup & Seed Script
=============================================================
This is the ONE script to rule them all.
It will:
  1. Create/reset the database at the correct absolute path
  2. Create all tables
  3. Create default admin + manager users
  4. Seed comprehensive demo data (products, customers, sales, expenses, campaigns)

Usage:
  cd backend
  python setup_and_seed.py          # Add data (keeps existing)
  python setup_and_seed.py --reset  # Delete DB and start fresh
"""

import sys
import os
import random
import string
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# ========== PATH SETUP ==========
# Ensure we're importing from the right place regardless of CWD
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(str(BACKEND_DIR))  # Set CWD to backend dir

DB_FILE = BACKEND_DIR / "skope_erp.db"

print("=" * 70)
print("  SKOPE ERP - Database Setup & Seed")
print("=" * 70)
print(f"  Backend Dir : {BACKEND_DIR}")
print(f"  Database    : {DB_FILE}")
print(f"  CWD         : {os.getcwd()}")
print("=" * 70)

# ========== HANDLE --reset FLAG ==========
if "--reset" in sys.argv:
    print("\n[!!] --reset flag detected. Deleting existing database...")
    # Delete all possible old database files
    for old_db in ["skope_erp.db", "rms.db", "rms_new.db"]:
        old_path = BACKEND_DIR / old_db
        if old_path.exists():
            old_path.unlink()
            print(f"   Deleted: {old_path}")
    # Also check inside app/ directory for stale copies
    for old_db in ["skope_erp.db", "rms.db", "rms_new.db"]:
        old_path = BACKEND_DIR / "app" / old_db
        if old_path.exists():
            old_path.unlink()
            print(f"   Deleted stale copy: {old_path}")
    print("   Database cleared. Starting fresh.\n")

# ========== IMPORT APP MODULES ==========
from app.db.database import engine, SessionLocal, Base
from app.db import models
from app.core.security import get_password_hash
from app.core.config import settings

print(f"\n[CONFIG] SQLAlchemy URL: {settings.DATABASE_URL}")

# ========== CREATE TABLES ==========
print("\n[1/6] Creating database tables...")
models.Base.metadata.create_all(bind=engine)
print("   [OK] All tables created successfully.")

# ========== VERIFY DB FILE EXISTS ==========
if DB_FILE.exists():
    size_kb = DB_FILE.stat().st_size / 1024
    print(f"   [OK] Database file verified: {DB_FILE} ({size_kb:.0f} KB)")
else:
    print(f"   [!!] WARNING: Database file NOT found at {DB_FILE}")
    print(f"   Checking other locations...")
    # Try to find where it was actually created
    for search_dir in [BACKEND_DIR, BACKEND_DIR / "app", Path.cwd()]:
        for f in search_dir.glob("*.db"):
            print(f"   Found: {f}")

# ========== CREATE DEFAULT USERS ==========
print("\n[2/6] Creating default users...")
db = SessionLocal()

try:
    # Create Default Store
    store = db.query(models.Store).first()
    if not store:
        store = models.Store(
            name="SKOPE Electronics & Lifestyle",
            address="Phoenix Marketcity, Kurla West, Mumbai, Maharashtra 400070",
            phone="+91-22-61801100",
            email="contact@skope-electronics.com",
            gst_number="27AABCS1234F1Z5",
            is_active=True
        )
        db.add(store)
        db.commit()
        db.refresh(store)
        print("   [OK] Created default store: SKOPE Electronics & Lifestyle")
    else:
        print(f"   [OK] Store already exists: {store.name}")

    store_id = store.id

    # Create Admin User
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        admin = db.query(models.User).filter(models.User.email == "admin@store.com").first()
    
    if not admin:
        admin = models.User(
            email="admin@store.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role=models.UserRole.SUPER_ADMIN,
            store_id=store_id,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("   [OK] Created admin user (admin / admin123)")
    else:
        # Reset password to ensure it works
        admin.hashed_password = get_password_hash("admin123")
        admin.is_active = True
        admin.store_id = store_id
        db.commit()
        print("   [OK] Admin user exists, password reset (admin / admin123)")

    # Create Manager User
    manager = db.query(models.User).filter(models.User.username == "manager").first()
    if not manager:
        manager = db.query(models.User).filter(models.User.email == "manager@store.com").first()
    
    if not manager:
        manager = models.User(
            email="manager@store.com",
            username="manager",
            hashed_password=get_password_hash("manager123"),
            full_name="Store Manager",
            role=models.UserRole.STORE_MANAGER,
            store_id=store_id,
            is_active=True
        )
        db.add(manager)
        db.commit()
        print("   [OK] Created manager user (manager / manager123)")
    else:
        manager.hashed_password = get_password_hash("manager123")
        manager.is_active = True
        manager.store_id = store_id
        db.commit()
        print("   [OK] Manager user exists, password reset (manager / manager123)")

    # ========== SEED COMPREHENSIVE DATA ==========
    
    # --- Configuration ---
    TARGET_SALES = 2500
    TARGET_CUSTOMERS = 300
    TARGET_CAMPAIGNS = 25
    HISTORY_DAYS = 365

    FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
                   "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Kiara", "Riya", "Anvi", "Angel", "Myra",
                   "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anita", "Rajesh", "Neha", "Suresh", "Ramesh",
                   "Sunita", "Gita", "Manoj", "Kavita", "Pooja", "Rohit", "Deepa", "Karan", "Meera", "Om"]
    LAST_NAMES = ["Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Saxena", "Mehta", "Jain", "Singh", "Yadav",
                  "Das", "Patel", "Shah", "Rao", "Nair", "Iyer", "Reddy", "Chopra", "Kapoor", "Khan",
                  "Kumar", "Mishra", "Joshi", "Desai", "Gawde", "Sawant", "Kulkarni", "Pillai", "Sinha", "Bose"]
    CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"]
    DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "skope.com"]

    PRODUCTS_DATA = [
        ("iPhone 15 Pro Max", "Electronics", "Apple", 134999, 149999, 12, 18.0, "Premium flagship smartphone"),
        ("iPhone 15 Pro", "Electronics", "Apple", 119999, 134999, 12, 18.0, "Pro smartphone with titanium design"),
        ("iPhone 15", "Electronics", "Apple", 69999, 79999, 12, 18.0, "Latest iPhone with Dynamic Island"),
        ("Samsung Galaxy S24 Ultra", "Electronics", "Samsung", 109999, 129999, 12, 18.0, "Ultimate Galaxy experience"),
        ("Samsung Galaxy S24", "Electronics", "Samsung", 69999, 84999, 12, 18.0, "Premium Android flagship"),
        ("MacBook Air M3", "Electronics", "Apple", 99999, 114999, 12, 18.0, "Supercharged by M3 chip"),
        ("MacBook Pro 14", "Electronics", "Apple", 169999, 199999, 24, 18.0, "Pro laptop for professionals"),
        ("iPad Pro 12.9", "Electronics", "Apple", 99999, 112999, 12, 18.0, "Ultimate iPad experience"),
        ("iPad Air", "Electronics", "Apple", 59999, 69999, 12, 18.0, "Powerful and versatile"),
        ("Apple Watch Series 9", "Electronics", "Apple", 41999, 49999, 12, 18.0, "Advanced health features"),
        ("Apple Watch Ultra 2", "Electronics", "Apple", 79999, 89999, 24, 18.0, "Adventure-ready smartwatch"),
        ("AirPods Pro 2", "Electronics", "Apple", 20999, 24999, 12, 18.0, "Active noise cancellation"),
        ("AirPods Max", "Electronics", "Apple", 49999, 59999, 12, 18.0, "High-fidelity audio"),
        ("Sony WH-1000XM5", "Electronics", "Sony", 24999, 29999, 24, 18.0, "Industry-leading noise cancellation"),
        ("Sony WF-1000XM5", "Electronics", "Sony", 19999, 24999, 12, 18.0, "Premium true wireless earbuds"),
        ("Dell XPS 15", "Electronics", "Dell", 129999, 149999, 24, 18.0, "Premium Windows laptop"),
        ("Dell XPS 13", "Electronics", "Dell", 99999, 119999, 24, 18.0, "Ultraportable powerhouse"),
        ("HP Spectre x360", "Electronics", "HP", 109999, 129999, 24, 18.0, "Convertible laptop"),
        ("Samsung 65 OLED TV", "Electronics", "Samsung", 149999, 179999, 36, 18.0, "Stunning OLED display"),
        ("Samsung 55 QLED TV", "Electronics", "Samsung", 79999, 99999, 36, 18.0, "Quantum dot technology"),
        ("LG C3 OLED 55", "Electronics", "LG", 119999, 139999, 36, 18.0, "Perfect blacks OLED"),
        ("Sony Bravia 55", "Electronics", "Sony", 89999, 109999, 36, 18.0, "Cognitive processor XR"),
        ("Bose SoundLink Max", "Electronics", "Bose", 29999, 34999, 12, 18.0, "Powerful portable speaker"),
        ("JBL Flip 6", "Electronics", "JBL", 9999, 12999, 12, 18.0, "Waterproof Bluetooth speaker"),
        ("Canon EOS R6 II", "Electronics", "Canon", 199999, 229999, 24, 18.0, "Full-frame mirrorless camera"),
        ("Sony A7 IV", "Electronics", "Sony", 219999, 249999, 24, 18.0, "Professional mirrorless"),
        ("Nike Air Max 270", "Footwear", "Nike", 8999, 12999, 0, 12.0, "Lifestyle sneakers"),
        ("Nike Air Jordan 1", "Footwear", "Nike", 12999, 16999, 0, 12.0, "Iconic basketball shoes"),
        ("Nike Dunk Low", "Footwear", "Nike", 7999, 10999, 0, 12.0, "Classic streetwear"),
        ("Adidas Ultraboost 23", "Footwear", "Adidas", 13999, 17999, 0, 12.0, "Ultimate running comfort"),
        ("Adidas Stan Smith", "Footwear", "Adidas", 6999, 9999, 0, 12.0, "Timeless tennis shoes"),
        ("Puma RS-X", "Footwear", "Puma", 6999, 9999, 0, 12.0, "Retro running style"),
        ("Reebok Classic", "Footwear", "Reebok", 5999, 7999, 0, 12.0, "Heritage sneakers"),
        ("New Balance 574", "Footwear", "New Balance", 7999, 10999, 0, 12.0, "Classic comfort"),
        ("Levi's 501 Original", "Clothing", "Levi's", 3999, 5499, 0, 5.0, "Iconic straight fit jeans"),
        ("Levi's 511 Slim", "Clothing", "Levi's", 3499, 4999, 0, 5.0, "Modern slim fit"),
        ("Tommy Hilfiger Polo", "Clothing", "Tommy", 2999, 4499, 0, 5.0, "Classic polo shirt"),
        ("Ralph Lauren Oxford", "Clothing", "Ralph Lauren", 5999, 7999, 0, 5.0, "Premium oxford shirt"),
        ("Zara Blazer", "Clothing", "Zara", 4999, 6999, 0, 5.0, "Contemporary blazer"),
        ("H&M Hoodie", "Clothing", "H&M", 1999, 2999, 0, 5.0, "Casual comfort"),
        ("Uniqlo Airism Tee", "Clothing", "Uniqlo", 999, 1499, 0, 5.0, "Breathable basics"),
        ("Allen Solly Formal", "Clothing", "Allen Solly", 2499, 3499, 0, 5.0, "Office wear"),
        ("Peter England Shirt", "Clothing", "Peter England", 1499, 2299, 0, 5.0, "Formal shirts"),
        ("Van Heusen Trousers", "Clothing", "Van Heusen", 1999, 2999, 0, 5.0, "Formal trousers"),
        ("Basmati Rice 10kg", "Groceries", "India Gate", 899, 1199, 0, 5.0, "Premium long grain rice"),
        ("Tata Salt 1kg", "Groceries", "Tata", 25, 32, 0, 5.0, "Iodized salt"),
        ("Fortune Oil 5L", "Groceries", "Fortune", 699, 849, 0, 5.0, "Refined sunflower oil"),
        ("Aashirvaad Atta 10kg", "Groceries", "Aashirvaad", 449, 549, 0, 5.0, "Whole wheat flour"),
        ("Maggi Noodles Pack", "Groceries", "Nestle", 120, 150, 0, 12.0, "Instant noodles 12 pack"),
        ("Tata Tea Gold 1kg", "Groceries", "Tata", 499, 599, 0, 5.0, "Premium tea"),
        ("Nescafe Classic 200g", "Groceries", "Nestle", 449, 549, 0, 18.0, "Instant coffee"),
        ("Amul Butter 500g", "Groceries", "Amul", 275, 320, 0, 5.0, "Fresh butter"),
        ("Surf Excel 4kg", "Home Care", "HUL", 549, 649, 0, 18.0, "Detergent powder"),
        ("Vim Dishwash 1.5L", "Home Care", "HUL", 199, 249, 0, 18.0, "Dishwash liquid"),
        ("Harpic 1L", "Home Care", "Reckitt", 179, 219, 0, 18.0, "Toilet cleaner"),
        ("Dettol 900ml", "Home Care", "Reckitt", 199, 249, 0, 18.0, "Antiseptic liquid"),
        ("Lakme Face Cream", "Beauty", "Lakme", 399, 549, 0, 28.0, "Daily moisturizer"),
        ("Dove Shampoo 650ml", "Beauty", "Dove", 399, 499, 0, 18.0, "Nourishing shampoo"),
        ("Nivea Body Lotion", "Beauty", "Nivea", 299, 399, 0, 18.0, "Deep moisture care"),
        ("Maybelline Lipstick", "Beauty", "Maybelline", 599, 799, 0, 28.0, "Matte finish lipstick"),
        ("L'Oreal Face Wash", "Beauty", "L'Oreal", 349, 449, 0, 18.0, "Deep clean face wash"),
        ("Godrej Office Chair", "Furniture", "Godrej", 8999, 12999, 12, 18.0, "Ergonomic office chair"),
        ("Nilkamal Plastic Chair", "Furniture", "Nilkamal", 999, 1499, 6, 18.0, "Durable plastic chair"),
        ("Urban Ladder Desk", "Furniture", "Urban Ladder", 12999, 17999, 12, 18.0, "Work from home desk"),
        ("Pepperfry Bookshelf", "Furniture", "Pepperfry", 5999, 8999, 12, 18.0, "Modern bookshelf"),
        ("Philips LED Bulb 9W", "Electricals", "Philips", 99, 149, 24, 18.0, "Energy efficient LED"),
        ("Havells Fan", "Electricals", "Havells", 2499, 3299, 24, 18.0, "Ceiling fan 1200mm"),
        ("Crompton Geyser 15L", "Electricals", "Crompton", 6999, 8999, 60, 18.0, "Water heater"),
        ("Bajaj Iron", "Electricals", "Bajaj", 799, 1099, 24, 18.0, "Dry iron press"),
        ("Prestige Cooker 5L", "Kitchen", "Prestige", 1999, 2699, 60, 18.0, "Pressure cooker"),
        ("Butterfly Mixer Grinder", "Kitchen", "Butterfly", 2999, 3999, 24, 18.0, "750W mixer grinder"),
        ("Philips Air Fryer", "Kitchen", "Philips", 7999, 9999, 24, 18.0, "Healthy cooking"),
        ("Borosil Glass Set", "Kitchen", "Borosil", 599, 849, 0, 12.0, "6 piece glass set"),
        ("Milton Water Bottle", "Kitchen", "Milton", 399, 549, 6, 12.0, "1L stainless steel"),
    ]

    # ========== SEED STAFF ==========
    print("\n[3/6] Creating staff members...")
    roles = [models.UserRole.SALES_STAFF, models.UserRole.STORE_MANAGER, models.UserRole.MARKETING, models.UserRole.ACCOUNTS]
    staff_pool = [admin, manager]

    for i in range(15):
        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        name = f"{fname} {lname}"
        email = f"{fname.lower()}.{lname.lower()}{random.randint(1,99)}@{random.choice(DOMAINS)}"
        
        existing = db.query(models.User).filter(models.User.email == email).first()
        if not existing:
            user = models.User(
                email=email,
                username=email.split('@')[0],
                hashed_password=get_password_hash("password123"),
                full_name=name,
                role=random.choice(roles),
                store_id=store_id,
                is_active=True
            )
            db.add(user)
            staff_pool.append(user)
        else:
            staff_pool.append(existing)
    
    db.commit()
    print(f"   [OK] {len(staff_pool)} staff members ready")

    # ========== SEED PRODUCTS ==========
    print("\n[4/6] Creating products...")
    existing_products = db.query(models.Product).count()
    
    if existing_products >= len(PRODUCTS_DATA):
        print(f"   [OK] Products already exist ({existing_products}). Skipping.")
    else:
        for p_data in PRODUCTS_DATA:
            name, cat, brand, cost, price, warranty, gst, desc = p_data
            existing = db.query(models.Product).filter(models.Product.name == name).first()
            if not existing:
                prod = models.Product(
                    name=name,
                    sku=f"SKU{random.randint(10000, 99999)}",
                    category=cat,
                    brand=brand,
                    description=desc,
                    unit_price=price,
                    cost_price=cost,
                    gst_rate=gst,
                    warranty_months=warranty,
                    current_stock=random.randint(50, 500),
                    minimum_stock=10,
                    store_id=store_id,
                    is_active=True
                )
                db.add(prod)
        db.commit()
    
    product_pool = db.query(models.Product).all()
    print(f"   [OK] {len(product_pool)} products ready")

    # ========== SEED CUSTOMERS ==========
    print(f"\n[5/6] Creating customers (target: {TARGET_CUSTOMERS})...")
    existing_customers = db.query(models.Customer).count()
    needed = max(0, TARGET_CUSTOMERS - existing_customers)
    
    if needed > 0:
        for _ in range(needed):
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{random.randint(1,999)}@{random.choice(DOMAINS)}"
            
            cust = models.Customer(
                name=name,
                email=email,
                phone=f"+91{random.choice(['9','8','7'])}{random.randint(100000000, 999999999)}",
                address=f"{random.randint(1, 999)}, {random.choice(CITIES)}, India",
                store_id=store_id,
                total_purchases=0,
                loyalty_points=0,
                created_at=datetime.now() - timedelta(days=random.randint(0, HISTORY_DAYS))
            )
            db.add(cust)
        db.commit()
    
    customer_pool = db.query(models.Customer).all()
    print(f"   [OK] {len(customer_pool)} customers ready")

    # ========== SEED SALES ==========
    print(f"\n[6/6] Creating sales (target: {TARGET_SALES})...")
    existing_sales = db.query(models.Sale).count()
    needed_sales = max(0, TARGET_SALES - existing_sales)
    
    if needed_sales > 0:
        end_date = datetime.now()
        
        batch_count = 0
        for i in range(needed_sales):
            # Random date weighted towards recent
            days_ago = int(random.triangular(0, HISTORY_DAYS, 0))
            sale_date = end_date - timedelta(days=days_ago)
            sale_date = sale_date.replace(hour=random.randint(10, 20), minute=random.randint(0, 59))
            
            cust = random.choice(customer_pool)
            seller = random.choice(staff_pool)
            
            sale = models.Sale(
                invoice_number=f"INV-{sale_date.strftime('%Y%m')}-{uuid.uuid4().hex[:8].upper()}",
                customer_id=cust.id,
                store_id=store_id,
                created_by=seller.id,
                sale_date=sale_date,
                payment_mode=random.choice(list(models.PaymentMode)),
                payment_status="completed",
                subtotal=0, gst_amount=0, total_amount=0, discount=0
            )
            
            db.add(sale)
            db.flush()
            
            num_items = random.choices([1, 2, 3, 4], weights=[50, 30, 15, 5], k=1)[0]
            selected_prods = random.sample(product_pool, min(num_items, len(product_pool)))
            
            subtotal = 0
            gst_total = 0
            
            for prod in selected_prods:
                qty = random.randint(1, 3)
                price = prod.unit_price
                total_p = price * qty
                gst = total_p * (prod.gst_rate / 100)
                
                item = models.SaleItem(
                    sale_id=sale.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=price,
                    gst_rate=prod.gst_rate,
                    gst_amount=gst,
                    total_price=total_p + gst
                )
                db.add(item)
                subtotal += total_p
                gst_total += gst
                
                if prod.current_stock > qty:
                    prod.current_stock -= qty
            
            discount = random.choice([0, 0, 0, 50, 100, 200, 500]) 
            sale.subtotal = subtotal
            sale.gst_amount = gst_total
            sale.discount = discount
            sale.total_amount = subtotal + gst_total - discount
            
            cust.total_purchases = (cust.total_purchases or 0) + sale.total_amount
            cust.loyalty_points = (cust.loyalty_points or 0) + int(sale.total_amount / 100)
            
            batch_count += 1
            if batch_count % 200 == 0:
                db.commit()
                print(f"   ... {batch_count}/{needed_sales} sales created")
        
        db.commit()
        print(f"   [OK] {batch_count} new sales created")
    else:
        print(f"   [OK] Already have {existing_sales} sales. Skipping.")

    # ========== SEED EXPENSES ==========
    print("\n   Creating expenses...")
    existing_expenses = db.query(models.Expense).count()
    
    if existing_expenses < 100:
        start_date = datetime.now() - timedelta(days=HISTORY_DAYS)
        curr = start_date
        end = datetime.now()
        expense_count = 0
        
        while curr < end:
            # Monthly Rent on 1st
            if curr.day == 1:
                rent = models.Expense(
                    store_id=store_id,
                    category="Rent",
                    description=f"Store Rent {curr.strftime('%B %Y')}",
                    amount=75000,
                    payment_mode=models.PaymentMode.UPI,
                    created_by=admin.id,
                    expense_date=curr
                )
                db.add(rent)
                expense_count += 1
            
            # Monthly Salary on 1st
            if curr.day == 1:
                salary = models.Expense(
                    store_id=store_id,
                    category="Salary",
                    description=f"Staff Salaries {curr.strftime('%B %Y')}",
                    amount=random.randint(200000, 350000),
                    payment_mode=models.PaymentMode.UPI,
                    created_by=admin.id,
                    expense_date=curr
                )
                db.add(salary)
                expense_count += 1
            
            # Random daily expenses (30% chance)
            if random.random() < 0.3:
                types = [
                    ("Utilities", "Electricity/Water bill", 2000, 8000),
                    ("Maintenance", "Shop maintenance", 500, 3000),
                    ("Tea/Coffee", "Office refreshments", 200, 800),
                    ("Stationery", "Office supplies", 300, 1500),
                    ("Transport", "Delivery charges", 500, 2000),
                    ("Marketing", "Local advertising", 1000, 5000),
                ]
                exp_type, desc, min_amt, max_amt = random.choice(types)
                exp = models.Expense(
                    store_id=store_id,
                    category=exp_type,
                    description=desc,
                    amount=random.randint(min_amt, max_amt),
                    payment_mode=random.choice([models.PaymentMode.CASH, models.PaymentMode.UPI]),
                    created_by=random.choice(staff_pool).id,
                    expense_date=curr
                )
                db.add(exp)
                expense_count += 1
            
            curr += timedelta(days=1)
        
        db.commit()
        print(f"   [OK] {expense_count} expenses created")
    else:
        print(f"   [OK] Already have {existing_expenses} expenses. Skipping.")

    # ========== SEED CAMPAIGNS ==========
    print("\n   Creating marketing campaigns...")
    existing_campaigns = db.query(models.Campaign).count()
    
    if existing_campaigns < 5:
        campaigns_data = [
            {
                'name': 'Diwali Mega Sale 2025',
                'description': 'Special Diwali offers with up to 50% discount on electronics',
                'campaign_type': models.CampaignType.WHATSAPP,
                'trigger_type': models.CampaignTrigger.FESTIVAL,
                'message_template': "🪔 Happy Diwali {customer_name}! ✨\n\nCelebrate with 50% OFF on all electronics!\nUse code: DIWALI50\n\nOffer valid till {end_date}\n\n🎊 Shop Now!",
                'status': models.CampaignStatus.ACTIVE,
                'discount_code': 'DIWALI50',
                'discount_percentage': 50.0,
                'start_date': datetime.now() - timedelta(days=5),
                'end_date': datetime.now() + timedelta(days=10),
                'send_time': '10:00',
                'total_sent': random.randint(150, 200),
                'total_opened': random.randint(100, 150),
                'total_clicked': random.randint(50, 80),
                'total_converted': random.randint(20, 40)
            },
            {
                'name': 'Birthday Special Wishes',
                'description': 'Automated birthday wishes with special discount',
                'campaign_type': models.CampaignType.SMS,
                'trigger_type': models.CampaignTrigger.BIRTHDAY,
                'message_template': "🎉 Happy Birthday {customer_name}! 🎂\n\nGet 20% OFF on your next purchase.\nUse code: BDAY20\n\nValid for 7 days!",
                'status': models.CampaignStatus.ACTIVE,
                'discount_code': 'BDAY20',
                'discount_percentage': 20.0,
                'days_before_trigger': 0,
                'send_time': '09:00',
                'total_sent': random.randint(30, 50),
                'total_opened': random.randint(25, 45),
                'total_clicked': random.randint(15, 30),
                'total_converted': random.randint(8, 15)
            },
            {
                'name': 'Warranty Expiry Alert',
                'description': 'Remind customers about expiring warranties',
                'campaign_type': models.CampaignType.WHATSAPP,
                'trigger_type': models.CampaignTrigger.WARRANTY_EXPIRY,
                'message_template': "⚠️ Warranty Expiring Soon!\n\nDear {customer_name},\n\nYour product warranty expires in {days} days. Get it serviced or upgrade now!",
                'status': models.CampaignStatus.ACTIVE,
                'days_before_trigger': 30,
                'send_time': '11:00',
                'total_sent': random.randint(20, 40),
                'total_opened': random.randint(15, 35),
                'total_clicked': random.randint(10, 25),
                'total_converted': random.randint(5, 12)
            },
            {
                'name': 'Win Back Campaign',
                'description': 'Re-engage customers who haven\'t purchased in 30 days',
                'campaign_type': models.CampaignType.EMAIL,
                'trigger_type': models.CampaignTrigger.NO_PURCHASE_30_DAYS,
                'message_template': "💜 We Miss You!\n\nHi {customer_name},\n\nGet 15% OFF your next purchase.\nCode: COMEBACK15\n\nValid for 7 days!",
                'status': models.CampaignStatus.ACTIVE,
                'discount_code': 'COMEBACK15',
                'discount_percentage': 15.0,
                'send_time': '14:00',
                'total_sent': random.randint(50, 80),
                'total_opened': random.randint(30, 60),
                'total_clicked': random.randint(15, 35),
                'total_converted': random.randint(8, 18)
            },
            {
                'name': 'Weekend Flash Sale',
                'description': 'Weekend special offers on clothing',
                'campaign_type': models.CampaignType.NOTIFICATION,
                'trigger_type': models.CampaignTrigger.MANUAL,
                'message_template': "⚡ Weekend Flash Sale!\n\n30% OFF this weekend only!\nCode: WEEKEND30",
                'status': models.CampaignStatus.COMPLETED,
                'discount_code': 'WEEKEND30',
                'discount_percentage': 30.0,
                'start_date': datetime.now() - timedelta(days=10),
                'end_date': datetime.now() - timedelta(days=8),
                'send_time': '09:00',
                'total_sent': random.randint(200, 250),
                'total_opened': random.randint(150, 200),
                'total_clicked': random.randint(80, 120),
                'total_converted': random.randint(35, 55)
            },
            {
                'name': 'Referral Program',
                'description': 'Encourage customers to refer friends',
                'campaign_type': models.CampaignType.SMS,
                'trigger_type': models.CampaignTrigger.MANUAL,
                'message_template': "👥 Refer & Earn!\n\nRefer a friend and both get 25% OFF!\nCode: REFER25",
                'status': models.CampaignStatus.SCHEDULED,
                'discount_code': 'REFER25',
                'discount_percentage': 25.0,
                'start_date': datetime.now() + timedelta(days=2),
                'end_date': datetime.now() + timedelta(days=30),
                'send_time': '10:30',
                'total_sent': 0,
                'total_opened': 0,
                'total_clicked': 0,
                'total_converted': 0
            },
            {
                'name': 'Republic Day Sale',
                'description': 'Republic Day special offers',
                'campaign_type': models.CampaignType.EMAIL,
                'trigger_type': models.CampaignTrigger.FESTIVAL,
                'message_template': "🇮🇳 Republic Day Sale!\n\n26% OFF on everything!\nCode: REPUBLIC26",
                'status': models.CampaignStatus.COMPLETED,
                'discount_code': 'REPUBLIC26',
                'discount_percentage': 26.0,
                'start_date': datetime.now() - timedelta(days=60),
                'end_date': datetime.now() - timedelta(days=57),
                'send_time': '08:00',
                'total_sent': random.randint(180, 220),
                'total_opened': random.randint(120, 180),
                'total_clicked': random.randint(60, 100),
                'total_converted': random.randint(25, 50)
            },
            {
                'name': 'New Year Celebration',
                'description': 'New Year special offers',
                'campaign_type': models.CampaignType.WHATSAPP,
                'trigger_type': models.CampaignTrigger.FESTIVAL,
                'message_template': "🎆 Happy New Year!\n\n40% OFF on everything!\nCode: NEWYEAR40",
                'status': models.CampaignStatus.PAUSED,
                'discount_code': 'NEWYEAR40',
                'discount_percentage': 40.0,
                'send_time': '08:00',
                'total_sent': random.randint(100, 150),
                'total_opened': random.randint(70, 120),
                'total_clicked': random.randint(40, 70),
                'total_converted': random.randint(18, 35)
            },
        ]
        
        for c_data in campaigns_data:
            campaign = models.Campaign(
                **c_data,
                store_id=store_id,
                created_by=admin.id
            )
            db.add(campaign)
        
        # Add more auto-generated campaigns
        camp_types = list(models.CampaignType)
        camp_statuses = list(models.CampaignStatus)
        for i in range(TARGET_CAMPAIGNS - len(campaigns_data)):
            c_date = datetime.now() - timedelta(days=random.randint(0, 180))
            camp = models.Campaign(
                store_id=store_id,
                name=f"Campaign {i+1} - {random.choice(['Summer Sale', 'Festival Offer', 'New Launch', 'Clearance', 'Season End'])}",
                description="Automated marketing campaign",
                campaign_type=random.choice(camp_types),
                trigger_type=models.CampaignTrigger.MANUAL,
                status=random.choice(camp_statuses),
                message_template="Hello {name}, checkout our latest offers!",
                start_date=c_date,
                end_date=c_date + timedelta(days=7),
                total_sent=random.randint(100, 1000),
                total_opened=random.randint(50, 800),
                total_clicked=random.randint(10, 400),
                total_converted=random.randint(5, 100),
                created_by=admin.id,
                created_at=c_date
            )
            db.add(camp)
        
        db.commit()
        total_campaigns = db.query(models.Campaign).count()
        print(f"   [OK] {total_campaigns} campaigns ready")
    else:
        print(f"   [OK] Already have {existing_campaigns} campaigns. Skipping.")

    # ========== FINAL SUMMARY ==========
    total_sales = db.query(models.Sale).count()
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_expenses = db.query(models.Expense).count()
    total_campaigns = db.query(models.Campaign).count()
    total_users = db.query(models.User).count()
    
    print("\n" + "=" * 70)
    print("  [SUCCESS] DATABASE SETUP COMPLETE!")
    print("=" * 70)
    print(f"\n  Database  : {DB_FILE}")
    print(f"  Size      : {DB_FILE.stat().st_size / (1024*1024):.1f} MB")
    print(f"\n  Data Summary:")
    print(f"    Users      : {total_users}")
    print(f"    Products   : {total_products}")
    print(f"    Customers  : {total_customers}")
    print(f"    Sales      : {total_sales}")
    print(f"    Expenses   : {total_expenses}")
    print(f"    Campaigns  : {total_campaigns}")
    print(f"\n  Login Credentials:")
    print(f"    Admin   → username: admin    / password: admin123")
    print(f"    Manager → username: manager  / password: manager123")
    print(f"\n  To start the backend:")
    print(f"    cd backend")
    print(f"    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
    print("=" * 70 + "\n")

except Exception as e:
    print(f"\n[FAIL] ERROR: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
