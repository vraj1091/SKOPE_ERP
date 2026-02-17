"""
Comprehensive Database Seeder for SKOPE ERP
Creates SQLite database with all tables and populates with demo data
"""
import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.db import models
from app.core.security import get_password_hash

# Sample data
PRODUCT_NAMES = [
    "Samsung Galaxy S23", "iPhone 14 Pro", "OnePlus 11", "Xiaomi 13 Pro",
    "Dell Laptop XPS 15", "HP Pavilion Gaming", "MacBook Air M2", "Lenovo ThinkPad",
    "Sony WH-1000XM5 Headphones", "AirPods Pro 2", "JBL Flip 6 Speaker", "Boat Airdopes",
    "Samsung 55\" 4K TV", "LG OLED TV", "Mi TV 43\"", "Sony Bravia 65\"",
    "Canon EOS R6", "Nikon Z6 II", "GoPro Hero 11", "DJI Mini 3 Pro",
    "iPad Pro 12.9\"", "Samsung Tab S8", "Kindle Paperwhite", "reMarkable 2",
    "PS5 Console", "Xbox Series X", "Nintendo Switch", "Steam Deck",
    "Dyson V15 Vacuum", "Philips Air Purifier", "Mi Robot Vacuum", "Eureka Forbes",
    "Office Chair Ergonomic", "Standing Desk", "Monitor 27\" 4K", "Mechanical Keyboard"
]

CUSTOMER_NAMES = [
    ("Rahul", "Sharma"), ("Priya", "Patel"), ("Amit", "Kumar"), ("Sneha", "Singh"),
    ("Vikram", "Reddy"), ("Anjali", "Gupta"), ("Rohan", "Mehta"), ("Pooja", "Joshi"),
    ("Sanjay", "Verma"), ("Neha", "Agarwal"), ("Arjun", "Nair"), ("Kavya", "Iyer"),
    ("Aditya", "Kapoor"), ("Riya", "Shah"), ("Karthik", "Pillai"), ("Divya", "Rao"),
    ("Varun", "Malhotra"), ("Sakshi", "Chopra"), ("Nikhil", "Desai"), ("Ishita", "Bose")
]

CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]

EXPENSE_CATEGORIES = ["rent", "utilities", "salaries", "marketing", "maintenance", "other"]

def create_stores(db: Session):
    """Create store locations"""
    print("Creating stores...")
    stores = [
        models.Store(
            name="SKOPE Mumbai Central",
            code="MUM-001",
            address="123 MG Road, Mumbai",
            city="Mumbai",
            state="Maharashtra",
            pincode="400001",
            phone="+91-22-12345678",
            email="mumbai@skope.com",
            manager_name="Rajesh Kumar",
            is_active=True
        ),
        models.Store(
            name="SKOPE Delhi NCR",
            code="DEL-001",
            address="456 Connaught Place, New Delhi",
            city="Delhi",
            state="Delhi",
            pincode="110001",
            phone="+91-11-98765432",
            email="delhi@skope.com",
            manager_name="Priya Sharma",
            is_active=True
        ),
        models.Store(
            name="SKOPE Bangalore Tech Park",
            code="BLR-001",
            address="789 Whitefield, Bangalore",
            city="Bangalore",
            state="Karnataka",
            pincode="560066",
            phone="+91-80-55443322",
            email="bangalore@skope.com",
            manager_name="Anil Reddy",
            is_active=True
        ),
    ]
    
    for store in stores:
        db.add(store)
    db.commit()
    
    print(f"✅ Created {len(stores)} stores")
    return stores

def create_users(db: Session, stores):
    """Create user accounts with different roles"""
    print("Creating users...")
    users = []
    
    # Super Admin
    admin = models.User(
        email="admin@store.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        full_name="System Administrator",
        role=models.UserRole.SUPER_ADMIN,
        is_active=True,
        store_id=None  # Super admin has access to all stores
    )
    users.append(admin)
    
    # Store Managers (one per store)
    for i, store in enumerate(stores):
        manager = models.User(
            email=f"manager{i+1}@store.com",
            username=f"manager{i+1}",
            hashed_password=get_password_hash("manager123"),
            full_name=store.manager_name,
            role=models.UserRole.STORE_MANAGER,
            is_active=True,
            store_id=store.id
        )
        users.append(manager)
    
    # Sales Staff
    for i in range(5):
        staff = models.User(
            email=f"sales{i+1}@store.com",
            username=f"sales{i+1}",
            hashed_password=get_password_hash("sales123"),
            full_name=f"Sales Staff {i+1}",
            role=models.UserRole.SALES_STAFF,
            is_active=True,
            store_id=stores[i % len(stores)].id
        )
        users.append(staff)
    
    # Marketing User
    marketing = models.User(
        email="marketing@store.com",
        username="marketing",
        hashed_password=get_password_hash("marketing123"),
        full_name="Marketing Manager",
        role=models.UserRole.MARKETING,
        is_active=True,
        store_id=None
    )
    users.append(marketing)
    
    # Accounts User
    accounts = models.User(
        email="accounts@store.com",
        username="accounts",
        hashed_password=get_password_hash("accounts123"),
        full_name="Accounts Manager",
        role=models.UserRole.ACCOUNTS,
        is_active=True,
        store_id=None
    )
    users.append(accounts)
    
    for user in users:
        db.add(user)
    db.commit()
    
    print(f"✅ Created {len(users)} users")
    return users

def create_products(db: Session, stores):
    """Create product inventory"""
    print("Creating products...")
    products = []
    
    for i, name in enumerate(PRODUCT_NAMES):
        store = stores[i % len(stores)]
        
        # Calculate prices
        cost_price = random.uniform(5000, 150000)
        selling_price = cost_price * random.uniform(1.2, 1.8)  # 20-80% markup
        
        product = models.Product(
            name=name,
            sku=f"SKU{1000 + i}",
            category=random.choice(["Electronics", "Computers", "Audio", "TV", "Gaming", "Accessories"]),
            cost_price=round(cost_price, 2),
            selling_price=round(selling_price, 2),
            current_stock=random.randint(5, 100),
            minimum_stock=random.randint(2, 10),
            description=f"High-quality {name} with latest features",
            barcode=f"BAR{10000 + i}",
            manufacturer="Brand",
            warranty_months=random.choice([6, 12, 24, 36]),
            store_id=store.id,
            is_active=True
        )
        products.append(product)
        db.add(product)
    
    db.commit()
    print(f"✅ Created {len(products)} products")
    return products

def create_customers(db: Session, stores):
    """Create customer records"""
    print("Creating customers...")
    customers = []
    
    for i, (first_name, last_name) in enumerate(CUSTOMER_NAMES):
        store = stores[i % len(stores)]
        
        customer = models.Customer(
            name=f"{first_name} {last_name}",
            email=f"{first_name.lower()}.{last_name.lower()}@email.com",
            phone=f"+91-{''.join([str(random.randint(0, 9)) for _ in range(10)])}",
            address=f"{random.randint(1, 999)} {random.choice(['MG Road', 'Park Street', 'Brigade Road', 'Commercial Street'])}",
            city=random.choice(CITIES),
            pincode=f"{random.randint(100000, 999999)}",
            date_of_birth=datetime.now() - timedelta(days=random.randint(7300, 18250)),  # 20-50 years
            total_purchases=0,  # Will be updated after sales
            last_purchase_date=None,
            loyalty_points=random.randint(0, 500),
            store_id=store.id,
            is_active=True
        )
        customers.append(customer)
        db.add(customer)
    
    db.commit()
    print(f"✅ Created {len(customers)} customers")
    return customers

def create_sales(db: Session, products, customers, users):
    """Create sales transactions"""
    print("Creating sales transactions...")
    sales = []
    
    # Create sales for last 60 days
    for day in range(60):
        sale_date = datetime.now() - timedelta(days=day)
        
        # 2-5 sales per day
        num_sales = random.randint(2, 5)
        
        for _ in range(num_sales):
            customer = random.choice(customers)
            user = random.choice([u for u in users if u.role == models.UserRole.SALES_STAFF or u.role == models.UserRole.STORE_MANAGER])
            
            # 1-3 items per sale
            num_items = random.randint(1, 3)
            sale_products = random.sample(products, num_items)
            
            # Calculate totals
            subtotal = sum(p.selling_price * random.randint(1, 2) for p in sale_products)
            discount = subtotal * random.choice([0, 0.05, 0.1, 0.15])  # 0-15% discount
            tax = (subtotal - discount) * 0.18  # 18% GST
            total = subtotal - discount + tax
            
            sale = models.Sale(
                customer_id=customer.id,
                user_id=user.id,
                store_id=user.store_id or customer.store_id,
                sale_date=sale_date,
                subtotal=round(subtotal, 2),
                discount=round(discount, 2),
                tax=round(tax, 2),
                total_amount=round(total, 2),
                payment_mode=random.choice([models.PaymentMode.CASH, models.PaymentMode.CARD, models.PaymentMode.UPI]),
                notes=f"Sale on {sale_date.strftime('%Y-%m-%d')}"
            )
            db.add(sale)
            db.flush()  # Get sale.id
            
            # Add sale items
            for product in sale_products:
                quantity = random.randint(1, 2)
                sale_item = models.SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=product.selling_price,
                    discount=0,
                    total_price=round(product.selling_price * quantity, 2)
                )
                db.add(sale_item)
                
                # Update product stock
                product.current_stock -= quantity
            
            # Update customer
            customer.total_purchases += total
            customer.last_purchase_date = sale_date
            customer.loyalty_points += int(total / 100)  # 1 point per ₹100
            
            sales.append(sale)
    
    db.commit()
    print(f"✅ Created {len(sales)} sales transactions")
    return sales

def create_expenses(db: Session, stores, users):
    """Create expense records"""
    print("Creating expenses...")
    expenses = []
    
    # Create expenses for last 60 days
    for day in range(60):
        expense_date = datetime.now() - timedelta(days=day)
        
        # 1-3 expenses per day
        num_expenses = random.randint(1, 3)
        
        for _ in range(num_expenses):
            store = random.choice(stores)
            user = random.choice([u for u in users if u.store_id == store.id or u.role == models.UserRole.SUPER_ADMIN])
            
            category = random.choice(EXPENSE_CATEGORIES)
            
            # Different amount ranges by category
            if category == "rent":
                amount = random.uniform(50000, 150000)
            elif category == "salaries":
                amount = random.uniform(30000, 80000)
            elif category == "utilities":
                amount = random.uniform(5000, 20000)
            elif category == "marketing":
                amount = random.uniform(10000, 50000)
            else:
                amount = random.uniform(1000, 15000)
            
            expense = models.Expense(
                store_id=store.id,
                user_id=user.id,
                category=category,
                amount=round(amount, 2),
                description=f"{category.title()} expense for {expense_date.strftime('%B %Y')}",
                expense_date=expense_date,
                receipt_number=f"REC-{random.randint(10000, 99999)}",
                payment_mode=random.choice(["Cash", "Bank Transfer", "Cheque", "UPI"]),
                vendor_name=f"Vendor {random.randint(1, 20)}"
            )
            expenses.append(expense)
            db.add(expense)
    
    db.commit()
    print(f"✅ Created {len(expenses)} expense records")
    return expenses

def create_campaigns(db: Session, stores, users):
    """Create marketing campaigns"""
    print("Creating marketing campaigns...")
    campaigns = []
    
    campaign_templates = [
        ("Festival Sale - Diwali", "Mega Diwali Sale! Get up to 50% off on all electronics!", models.CampaignType.WHATSAPP),
        ("Birthday Special", "Happy Birthday! Here's a special 20% discount just for you!", models.CampaignType.SMS),
        ("New Arrival Alert", "Check out our latest collection of premium smartphones!", models.CampaignType.EMAIL),
        ("Weekend Offer", "Weekend Flash Sale! Limited time offer on selected items.", models.CampaignType.NOTIFICATION),
        ("Warranty Reminder", "Your product warranty is expiring soon. Extend it now!", models.CampaignType.EMAIL),
        ("Win-back Campaign", "We miss you! Come back and get exclusive offers.", models.CampaignType.WHATSAPP),
    ]
    
    for i, (title, message, camp_type) in enumerate(campaign_templates):
        user = random.choice([u for u in users if u.role == models.UserRole.MARKETING or u.role == models.UserRole.SUPER_ADMIN])
        
        # Some campaigns for specific stores, some for all
        store_id = random.choice(stores).id if random.random() > 0.3 else None
        
        schedule_date = datetime.now() + timedelta(days=random.randint(-30, 30))
        
        campaign = models.Campaign(
            title=title,
            campaign_type=camp_type,
            message=message,
            trigger=random.choice([models.CampaignTrigger.MANUAL, models.CampaignTrigger.BIRTHDAY, models.CampaignTrigger.FESTIVAL]),
            status=random.choice([models.CampaignStatus.DRAFT, models.CampaignStatus.ACTIVE, models.CampaignStatus.COMPLETED]),
            schedule_date=schedule_date,
            target_audience=random.choice(["All Customers", "High Value Customers", "Inactive Customers", "Birthday Customers"]),
            user_id=user.id,
            store_id=store_id,
            sent_count=random.randint(50, 500) if random.random() > 0.5 else 0,
            success_count=random.randint(40, 450) if random.random() > 0.5 else 0,
            failed_count=random.randint(0, 50) if random.random() > 0.5 else 0,
        )
        campaigns.append(campaign)
        db.add(campaign)
    
    db.commit()
    print(f"✅ Created {len(campaigns)} marketing campaigns")
    return campaigns

def seed_database():
    """Main seeding function"""
    print("\n" + "="*60)
    print("  SKOPE ERP - Database Seeder")
    print("="*60 + "\n")
    
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created\n")
    
    # Create session
    db = SessionLocal()
    
    try:
        # Seed data in order (due to foreign key constraints)
        stores = create_stores(db)
        users = create_users(db, stores)
        products = create_products(db, stores)
        customers = create_customers(db, stores)
        sales = create_sales(db, products, customers, users)
        expenses = create_expenses(db, stores, users)
        campaigns = create_campaigns(db, stores, users)
        
        print("\n" + "="*60)
        print("  ✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   • Stores: {len(stores)}")
        print(f"   • Users: {len(users)}")
        print(f"   • Products: {len(products)}")
        print(f"   • Customers: {len(customers)}")
        print(f"   • Sales: {len(sales)}")
        print(f"   • Expenses: {len(expenses)}")
        print(f"   • Campaigns: {len(campaigns)}")
        print(f"\n🔐 Login Credentials:")
        print(f"   Admin: admin@store.com / admin123")
        print(f"   Manager: manager1@store.com / manager123")
        print(f"   Sales: sales1@store.com / sales123")
        print("\n" + "="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
