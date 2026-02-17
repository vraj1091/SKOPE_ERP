"""
Comprehensive Data Seeding Script
Target: >1000 records, 1 year history, all entities populated.
"""
import sys, os
import random
import string
import uuid
from datetime import datetime, timedelta
import math

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine
from app.db import models
from app.core.security import get_password_hash

# --- CONFIGURATION ---
TARGET_SALES = 2500       # > 1000 requested
TARGET_CUSTOMERS = 300
TARGET_CAMPAIGNS = 25
HISTORY_DAYS = 365        # 1 year of data
STORE_NAME = "SKOPE Electronics & Lifestyle"

# --- CONSTANTS ---
FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Kiara", "Riya", "Anvi", "Angel", "Myra", "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anita", "Rajesh", "Neha", "Suresh", "Ramesh", "Sunita", "Gita", "Manoj", "Kavita"]
LAST_NAMES = ["Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Saxena", "Mehta", "Jain", "Singh", "Yadav", "Das", "Patel", "Shah", "Rao", "Nair", "Iyer", "Reddy", "Chopra", "Kapoor", "Khan", "Kumar", "Mishra", "Joshi", "Desai", "Gawde", "Sawant", "Kulkarni"]
CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"]
DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "skope.com"]

PRODUCTS_DATA = [
     ("iPhone 15 Pro Max", "Electronics", "Apple", 134999, 149999, 12, "Premium flagship smartphone with A17 Pro chip"),
    ("iPhone 15 Pro", "Electronics", "Apple", 119999, 134999, 12, "Pro smartphone with titanium design"),
    ("iPhone 15", "Electronics", "Apple", 69999, 79999, 12, "Latest iPhone with Dynamic Island"),
    ("Samsung Galaxy S24 Ultra", "Electronics", "Samsung", 109999, 129999, 12, "Ultimate Galaxy experience"),
    ("Samsung Galaxy S24", "Electronics", "Samsung", 69999, 84999, 12, "Premium Android flagship"),
    ("MacBook Air M3", "Electronics", "Apple", 99999, 114999, 12, "Supercharged by M3 chip"),
    ("MacBook Pro 14", "Electronics", "Apple", 169999, 199999, 24, "Pro laptop for professionals"),
    ("iPad Pro 12.9", "Electronics", "Apple", 99999, 112999, 12, "Ultimate iPad experience"),
    ("iPad Air", "Electronics", "Apple", 59999, 69999, 12, "Powerful and versatile"),
    ("Apple Watch Series 9", "Electronics", "Apple", 41999, 49999, 12, "Advanced health features"),
    ("Apple Watch Ultra 2", "Electronics", "Apple", 79999, 89999, 24, "Adventure-ready smartwatch"),
    ("AirPods Pro 2", "Electronics", "Apple", 20999, 24999, 12, "Active noise cancellation"),
    ("AirPods Max", "Electronics", "Apple", 49999, 59999, 12, "High-fidelity audio"),
    ("Sony WH-1000XM5", "Electronics", "Sony", 24999, 29999, 24, "Industry-leading noise cancellation"),
    ("Sony WF-1000XM5", "Electronics", "Sony", 19999, 24999, 12, "Premium true wireless earbuds"),
    ("Dell XPS 15", "Electronics", "Dell", 129999, 149999, 24, "Premium Windows laptop"),
    ("Dell XPS 13", "Electronics", "Dell", 99999, 119999, 24, "Ultraportable powerhouse"),
    ("HP Spectre x360", "Electronics", "HP", 109999, 129999, 24, "Convertible laptop"),
    ("Samsung 65 OLED TV", "Electronics", "Samsung", 149999, 179999, 36, "Stunning OLED display"),
    ("Samsung 55 QLED TV", "Electronics", "Samsung", 79999, 99999, 36, "Quantum dot technology"),
    ("LG C3 OLED 55", "Electronics", "LG", 119999, 139999, 36, "Perfect blacks OLED"),
    ("Sony Bravia 55", "Electronics", "Sony", 89999, 109999, 36, "Cognitive processor XR"),
    ("Bose SoundLink Max", "Electronics", "Bose", 29999, 34999, 12, "Powerful portable speaker"),
    ("JBL Flip 6", "Electronics", "JBL", 9999, 12999, 12, "Waterproof Bluetooth speaker"),
    ("Canon EOS R6 II", "Electronics", "Canon", 199999, 229999, 24, "Full-frame mirrorless camera"),
    ("Sony A7 IV", "Electronics", "Sony", 219999, 249999, 24, "Professional mirrorless"),
    ("Nike Air Max 270", "Footwear", "Nike", 8999, 12999, 0, "Lifestyle sneakers"),
    ("Nike Air Jordan 1", "Footwear", "Nike", 12999, 16999, 0, "Iconic basketball shoes"),
    ("Nike Dunk Low", "Footwear", "Nike", 7999, 10999, 0, "Classic streetwear"),
    ("Adidas Ultraboost 23", "Footwear", "Adidas", 13999, 17999, 0, "Ultimate running comfort"),
    ("Adidas Stan Smith", "Footwear", "Adidas", 6999, 9999, 0, "Timeless tennis shoes"),
    ("Puma RS-X", "Footwear", "Puma", 6999, 9999, 0, "Retro running style"),
    ("Reebok Classic", "Footwear", "Reebok", 5999, 7999, 0, "Heritage sneakers"),
    ("New Balance 574", "Footwear", "New Balance", 7999, 10999, 0, "Classic comfort"),
    ("Levi's 501 Original", "Clothing", "Levi's", 3999, 5499, 0, "Iconic straight fit jeans"),
    ("Levi's 511 Slim", "Clothing", "Levi's", 3499, 4999, 0, "Modern slim fit"),
    ("Tommy Hilfiger Polo", "Clothing", "Tommy", 2999, 4499, 0, "Classic polo shirt"),
    ("Ralph Lauren Oxford", "Clothing", "Ralph Lauren", 5999, 7999, 0, "Premium oxford shirt"),
    ("Zara Blazer", "Clothing", "Zara", 4999, 6999, 0, "Contemporary blazer"),
    ("H&M Hoodie", "Clothing", "H&M", 1999, 2999, 0, "Casual comfort"),
    ("Uniqlo Airism Tee", "Clothing", "Uniqlo", 999, 1499, 0, "Breathable basics"),
    ("Allen Solly Formal", "Clothing", "Allen Solly", 2499, 3499, 0, "Office wear"),
    ("Peter England Shirt", "Clothing", "Peter England", 1499, 2299, 0, "Formal shirts"),
    ("Van Heusen Trousers", "Clothing", "Van Heusen", 1999, 2999, 0, "Formal trousers"),
    ("Basmati Rice 10kg", "Groceries", "India Gate", 899, 1199, 0, "Premium long grain rice"),
    ("Tata Salt 1kg", "Groceries", "Tata", 25, 32, 0, "Iodized salt"),
    ("Fortune Oil 5L", "Groceries", "Fortune", 699, 849, 0, "Refined sunflower oil"),
    ("Aashirvaad Atta 10kg", "Groceries", "Aashirvaad", 449, 549, 0, "Whole wheat flour"),
    ("Maggi Noodles Pack", "Groceries", "Nestle", 120, 150, 0, "Instant noodles 12 pack"),
    ("Tata Tea Gold 1kg", "Groceries", "Tata", 499, 599, 0, "Premium tea"),
    ("Nescafe Classic 200g", "Groceries", "Nestle", 449, 549, 0, "Instant coffee"),
    ("Amul Butter 500g", "Groceries", "Amul", 275, 320, 0, "Fresh butter"),
    ("Surf Excel 4kg", "Home Care", "HUL", 549, 649, 0, "Detergent powder"),
    ("Vim Dishwash 1.5L", "Home Care", "HUL", 199, 249, 0, "Dishwash liquid"),
    ("Harpic 1L", "Home Care", "Reckitt", 179, 219, 0, "Toilet cleaner"),
    ("Dettol 900ml", "Home Care", "Reckitt", 199, 249, 0, "Antiseptic liquid"),
    ("Lakme Face Cream", "Beauty", "Lakme", 399, 549, 0, "Daily moisturizer"),
    ("Dove Shampoo 650ml", "Beauty", "Dove", 399, 499, 0, "Nourishing shampoo"),
    ("Nivea Body Lotion", "Beauty", "Nivea", 299, 399, 0, "Deep moisture care"),
    ("Maybelline Lipstick", "Beauty", "Maybelline", 599, 799, 0, "Matte finish lipstick"),
    ("L'Oreal Face Wash", "Beauty", "L'Oreal", 349, 449, 0, "Deep clean face wash"),
    ("Godrej Office Chair", "Furniture", "Godrej", 8999, 12999, 12, "Ergonomic office chair"),
    ("Nilkamal Plastic Chair", "Furniture", "Nilkamal", 999, 1499, 6, "Durable plastic chair"),
    ("Urban Ladder Desk", "Furniture", "Urban Ladder", 12999, 17999, 12, "Work from home desk"),
    ("Pepperfry Bookshelf", "Furniture", "Pepperfry", 5999, 8999, 12, "Modern bookshelf"),
    ("Philips LED Bulb 9W", "Electricals", "Philips", 99, 149, 24, "Energy efficient LED"),
    ("Havells Fan", "Electricals", "Havells", 2499, 3299, 24, "Ceiling fan 1200mm"),
    ("Crompton Geyser 15L", "Electricals", "Crompton", 6999, 8999, 60, "Water heater"),
    ("Bajaj Iron", "Electricals", "Bajaj", 799, 1099, 24, "Dry iron press"),
    ("Prestige Cooker 5L", "Kitchen", "Prestige", 1999, 2699, 60, "Pressure cooker"),
    ("Butterfly Mixer Grinder", "Kitchen", "Butterfly", 2999, 3999, 24, "750W mixer grinder"),
    ("Philips Air Fryer", "Kitchen", "Philips", 7999, 9999, 24, "Healthy cooking"),
    ("Borosil Glass Set", "Kitchen", "Borosil", 599, 849, 0, "6 piece glass set"),
    ("Milton Water Bottle", "Kitchen", "Milton", 399, 549, 6, "1L stainless steel")
]

# --- HELPERS ---
def generate_phone():
    return f"+91{random.choice(['9', '8', '7'])}{random.randint(100000000, 999999999)}"

def generate_gst():
    return f"27{random.choice(string.ascii_uppercase)}{random.randint(1000,9999)}{random.choice(string.ascii_uppercase)}1Z{random.randint(0,9)}"

def generate_name_email():
    fname = random.choice(FIRST_NAMES)
    lname = random.choice(LAST_NAMES)
    name = f"{fname} {lname}"
    email = f"{fname.lower()}.{lname.lower()}{random.randint(1,99)}@{random.choice(DOMAINS)}"
    return name, email

# --- SEEDING FUNCTIONS ---

def seed_comprehensive():
    print(f"\n⚡ Starting COMPREHENSIVE Data Seeding...")
    print(f"Goal: {TARGET_SALES}+ Sales, {TARGET_CUSTOMERS} Customers, {HISTORY_DAYS} Days History")
    
    db = SessionLocal()
    
    try:
        # 1. Store
        store = db.query(models.Store).first()
        if not store:
            store = models.Store(
                name=STORE_NAME,
                address="Phoenix Marketcity, Kurla West, Mumbai, Maharashtra 400070",
                phone="+91-22-61801100",
                email="contact@skope-electronics.com",
                gst_number="27AABCS1234F1Z5",
                is_active=True
            )
            db.add(store)
            db.commit()
            db.refresh(store)
        store_id = store.id
        print("✅ Store configured.")

        # 2. Users (Staff)
        roles = [models.UserRole.SALES_STAFF, models.UserRole.STORE_MANAGER, models.UserRole.MARKETING, models.UserRole.ACCOUNTS]
        staff_pool = []
        for i in range(15): # 15 Staff members
            name, email = generate_name_email()
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
        print(f"✅ Users checked/added. Total pool: {len(staff_pool)}")

        # 3. Products
        product_pool = []
        for p_data in PRODUCTS_DATA:
            name, cat, brand, cost, price, warranty, desc = p_data
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
                    warranty_months=warranty,
                    current_stock=random.randint(50, 500), # Good stock
                    minimum_stock=10,
                    store_id=store_id,
                    is_active=True
                )
                db.add(prod)
                product_pool.append(prod)
            else:
                product_pool.append(existing)
        db.commit()
        
        # Refresh product pool
        product_pool = db.query(models.Product).all()
        print(f"✅ {len(product_pool)} products ready.")

        # 4. Customers
        print(f"⏳ Generating {TARGET_CUSTOMERS} customers (this might take a moment)...")
        existing_count = db.query(models.Customer).count()
        needed = max(0, TARGET_CUSTOMERS - existing_count)
        
        customers = []
        if needed > 0:
            for _ in range(needed):
                name, email = generate_name_email()
                cust = models.Customer(
                    name=name,
                    email=email,
                    phone=generate_phone(),
                    address=f"{random.randint(1, 999)}, {random.choice(CITIES)}, India",
                    store_id=store_id,
                    created_at=datetime.now() - timedelta(days=random.randint(0, HISTORY_DAYS))
                )
                db.add(cust)
                customers.append(cust)
            db.commit()
        
        # Refresh customer pool
        customer_pool = db.query(models.Customer).all()
        print(f"✅ {len(customer_pool)} customers ready.")

        # 5. Sales & SaleItems (The Big One)
        print(f"⏳ Generating {TARGET_SALES} historical sales (spanning last {HISTORY_DAYS} days)...")
        existing_sales = db.query(models.Sale).count()
        needed_sales = max(0, TARGET_SALES - existing_sales)
        
        if needed_sales > 0:
            sales_batch = []
            
            # Distribution: Weighted towards recent dates (growth)
            # Create a timeline
            end_date = datetime.now()
            start_date = end_date - timedelta(days=HISTORY_DAYS)
            
            for i in range(needed_sales):
                # Random date, weighted slightly to weekends and recent times
                days_ago = int(random.triangular(0, HISTORY_DAYS, 0)) # Mode is 0 (today), so more recent sales
                sale_date = end_date - timedelta(days=days_ago)
                
                # Weekend boost logic
                if sale_date.weekday() >= 5: # Sat/Sun
                    # Keep it
                    pass
                else:
                    # 20% chance to skip weekdays to simulate weekend peaks, or just keep it
                    pass
                
                # set time
                sale_date = sale_date.replace(hour=random.randint(10, 20), minute=random.randint(0, 59))
                
                cust = random.choice(customer_pool)
                seller = random.choice(staff_pool)
                
                # Create Sale
                sale = models.Sale(
                    invoice_number=f"INV-{sale_date.strftime('%Y%m')}-{uuid.uuid4().hex[:8].upper()}",
                    customer_id=cust.id,
                    store_id=store_id,
                    created_by=seller.id,
                    sale_date=sale_date,
                    payment_mode=random.choice(list(models.PaymentMode)),
                    payment_status="completed",
                    # Amounts to be calculated
                    subtotal=0, gst_amount=0, total_amount=0, discount=0
                )
                
                # Items
                num_items = random.choices([1, 2, 3, 4], weights=[50, 30, 15, 5], k=1)[0]
                selected_prods = random.sample(product_pool, num_items)
                
                db.add(sale)
                db.flush() # get ID
                
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
                    
                    # Update Stock (simplified, don't go negative mostly)
                    if prod.current_stock > qty:
                        prod.current_stock -= qty

                sale.subtotal = subtotal
                sale.gst_amount = gst_total
                sale.total_amount = subtotal + gst_total
                
                # Update Customer
                cust.total_purchases += sale.total_amount
                cust.loyalty_points += int(sale.total_amount / 100)
                
                if i % 100 == 0:
                    print(f"  ... {i}/{needed_sales} sales generated")
                    db.commit() # Commit chunks
            
            db.commit()
            print("✅ Sales generation complete.")

        # 6. Expenses
        print("⏳ Generating Expenses...")
        # Recurrent expenses: Rent, Salary
        # Daily expenses
        curr = start_date
        while curr < end_date:
            # Monthly Rent - 1st of month
            if curr.day == 1:
                rent = models.Expense(
                    store_id=store_id,
                    category="Rent",
                    description=f"Store Rent {curr.strftime('%B')}",
                    amount=75000,
                    payment_mode=models.PaymentMode.UPI,
                    created_by=staff_pool[0].id,
                    expense_date=curr
                )
                db.add(rent)
            
            # Random daily
            if random.random() < 0.3: # 30% chance per day
                types = ["Utilities", "Maintenance", "Tea/Coffee", "Stationery"]
                exp_type = random.choice(types)
                exp = models.Expense(
                    store_id=store_id,
                    category=exp_type,
                    description=f"Daily {exp_type}",
                    amount=random.randint(200, 5000),
                    payment_mode=models.PaymentMode.CASH,
                    created_by=staff_pool[0].id,
                    expense_date=curr
                )
                db.add(exp)
            
            curr += timedelta(days=1)
        db.commit()
        print("✅ Expenses generated.")

        # 7. Campaigns
        print("⏳ Generating Campaigns...")
        camp_types = list(models.CampaignType)
        camp_statuses = list(models.CampaignStatus)
        
        for i in range(TARGET_CAMPAIGNS):
             c_date = datetime.now() - timedelta(days=random.randint(0, 180))
             camp = models.Campaign(
                 store_id=store_id,
                 name=f"Campaign {i+1} - {random.choice(['Sale', 'Festival', 'New Launch'])}",
                 description="Generated campaign",
                 campaign_type=random.choice(camp_types),
                 trigger_type=models.CampaignTrigger.MANUAL,
                 status=random.choice(camp_statuses),
                 message_template="Hello {name}, checkout our offers!",
                 start_date=c_date,
                 end_date=c_date + timedelta(days=7),
                 total_sent=random.randint(100, 1000),
                 total_opened=random.randint(50, 800),
                 total_clicked=random.randint(10, 400),
                 total_converted=random.randint(5, 100),
                 created_by=staff_pool[0].id,
                 created_at=c_date
             )
             db.add(camp)
        db.commit()
        print("✅ Campaigns generated.")
        
        print("\n" + "="*50)
        print("🎉 SUCCESS! Database populated with robust dataset.")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_comprehensive()
