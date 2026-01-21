"""
Fresh Start Script - Completely reset and populate database
"""
import os
import sys
from app.db.database import SessionLocal, engine
from app.db import models
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random

# Delete existing database
db_path = "rms_new.db"
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Deleted existing database: {db_path}")

# Create all tables
print("\n=== Creating Database Tables ===")
models.Base.metadata.create_all(bind=engine)
print("All tables created successfully!")

# Initialize data
db = SessionLocal()

try:
    # Create default store
    print("\n=== Creating Default Store ===")
    store = models.Store(
        name="Main Store",
        address="123 Business Street, City, State - 123456",
        phone="+91-9876543210",
        email="store@example.com",
        gst_number="29ABCDE1234F1Z5",
        is_active=True
    )
    db.add(store)
    db.flush()
    print(f"Store created: {store.name}")

    # Create users
    print("\n=== Creating Users ===")
    users_data = [
        {"email": "admin@example.com", "username": "admin", "password": "admin123", "full_name": "System Administrator", "role": models.UserRole.SUPER_ADMIN},
        {"email": "manager@example.com", "username": "manager", "password": "manager123", "full_name": "Store Manager", "role": models.UserRole.STORE_MANAGER},
        {"email": "sales@example.com", "username": "sales", "password": "sales123", "full_name": "Sales Staff", "role": models.UserRole.SALES_STAFF},
    ]
    
    for user_data in users_data:
        user = models.User(
            email=user_data["email"],
            username=user_data["username"],
            hashed_password=get_password_hash(user_data["password"]),
            full_name=user_data["full_name"],
            role=user_data["role"],
            store_id=store.id,
            is_active=True
        )
        db.add(user)
        print(f"Created user: {user.username} ({user.role.value})")
    
    db.commit()
    
    # Get admin user for created_by fields
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    
    # Create products
    print("\n=== Creating Products ===")
    categories = {
        'Electronics': [
            {'name': 'Samsung Smartphone', 'price': 15000, 'stock': 25},
            {'name': 'Apple iPhone', 'price': 75000, 'stock': 10},
            {'name': 'Sony Headphones', 'price': 3500, 'stock': 40},
            {'name': 'LG Smart TV', 'price': 45000, 'stock': 8},
            {'name': 'Dell Laptop', 'price': 55000, 'stock': 15},
        ],
        'Clothing': [
            {'name': 'Nike T-Shirt', 'price': 1200, 'stock': 100},
            {'name': 'Levis Jeans', 'price': 3500, 'stock': 50},
            {'name': 'Adidas Shoes', 'price': 4500, 'stock': 30},
            {'name': 'Puma Jacket', 'price': 2800, 'stock': 20},
        ],
        'Food & Beverages': [
            {'name': 'Nestle Coffee', 'price': 250, 'stock': 200},
            {'name': 'Coca Cola', 'price': 40, 'stock': 500},
            {'name': 'Britannia Cookies', 'price': 50, 'stock': 300},
        ],
        'Home & Kitchen': [
            {'name': 'Prestige Cooker', 'price': 2500, 'stock': 25},
            {'name': 'Philips Mixer', 'price': 3500, 'stock': 15},
            {'name': 'Milton Bottle', 'price': 450, 'stock': 80},
        ],
    }
    
    products_list = []
    for category, items in categories.items():
        for item in items:
            product = models.Product(
                sku=f"SKU{random.randint(10000, 99999)}",
                name=item['name'],
                description=f"High quality {item['name'].lower()}",
                category=category,
                brand=item['name'].split()[0],
                unit_price=item['price'],
                cost_price=item['price'] * 0.7,
                gst_rate=18.0,
                warranty_months=12 if category == 'Electronics' else 0,
                current_stock=item['stock'],
                minimum_stock=10,
                store_id=store.id,
                is_active=True
            )
            db.add(product)
            products_list.append(product)
    
    db.flush()
    print(f"Created {len(products_list)} products")
    
    # Create customers
    print("\n=== Creating Customers ===")
    customer_names = [
        'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
        'Anjali Gupta', 'Rohit Verma', 'Pooja Desai', 'Arjun Nair', 'Divya Iyer',
        'Karan Mehta', 'Neha Joshi', 'Sanjay Rao', 'Kavita Pillai', 'Rahul Chopra'
    ]
    
    customers_list = []
    for i, name in enumerate(customer_names):
        customer = models.Customer(
            name=name,
            email=f"{name.lower().replace(' ', '.')}@email.com",
            phone=f"+91{random.randint(7000000000, 9999999999)}",
            address=f"{random.randint(1, 999)} Main Street, City - {random.randint(100000, 999999)}",
            date_of_birth=datetime.now() - timedelta(days=random.randint(7300, 18250)),
            store_id=store.id,
            total_purchases=0,
            loyalty_points=0
        )
        db.add(customer)
        customers_list.append(customer)
    
    db.flush()
    print(f"Created {len(customers_list)} customers")
    
    # Create sales
    print("\n=== Creating Sales Transactions ===")
    sales_count = 0
    for day_offset in range(30):
        num_sales = random.randint(2, 5)
        
        for _ in range(num_sales):
            sale_date = datetime.now() - timedelta(days=day_offset, hours=random.randint(0, 23))
            customer = random.choice(customers_list) if random.random() > 0.3 else None
            
            # Select 1-3 random products
            sale_products = random.sample(products_list, random.randint(1, 3))
            
            subtotal = 0
            gst_amount = 0
            sale_items_data = []
            
            for product in sale_products:
                quantity = random.randint(1, 2)
                item_total = product.unit_price * quantity
                item_gst = (item_total * product.gst_rate) / 100
                
                subtotal += item_total
                gst_amount += item_gst
                
                sale_items_data.append({
                    'product': product,
                    'quantity': quantity,
                    'unit_price': product.unit_price,
                    'gst_rate': product.gst_rate,
                    'gst_amount': item_gst,
                    'total_price': item_total + item_gst
                })
            
            discount = random.choice([0, 50, 100]) if random.random() > 0.8 else 0
            total_amount = subtotal + gst_amount - discount
            
            sale = models.Sale(
                invoice_number=f"INV{store.id}{sale_date.strftime('%Y%m%d')}{random.randint(1000, 9999)}",
                customer_id=customer.id if customer else None,
                store_id=store.id,
                subtotal=subtotal,
                gst_amount=gst_amount,
                discount=discount,
                total_amount=total_amount,
                payment_mode=random.choice([models.PaymentMode.CASH, models.PaymentMode.CARD, models.PaymentMode.UPI]),
                payment_status='completed',
                created_by=admin_user.id,
                sale_date=sale_date
            )
            db.add(sale)
            db.flush()
            
            # Add sale items
            for item_data in sale_items_data:
                sale_item = models.SaleItem(
                    sale_id=sale.id,
                    product_id=item_data['product'].id,
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                    gst_rate=item_data['gst_rate'],
                    gst_amount=item_data['gst_amount'],
                    total_price=item_data['total_price']
                )
                db.add(sale_item)
            
            # Update customer total
            if customer:
                customer.total_purchases += total_amount
                customer.loyalty_points += int(total_amount / 100)
            
            sales_count += 1
    
    print(f"Created {sales_count} sales transactions")
    
    # Create expenses
    print("\n=== Creating Expenses ===")
    expense_categories = [
        ('rent', 'Monthly rent', 15000, 25000),
        ('utilities', 'Electricity bill', 2000, 5000),
        ('utilities', 'Water bill', 500, 1500),
        ('salary', 'Staff salary', 15000, 30000),
        ('maintenance', 'Store maintenance', 1000, 5000),
        ('other', 'Miscellaneous', 500, 3000)
    ]
    
    expenses_count = 0
    for day_offset in range(30):
        num_expenses = random.randint(1, 2)
        
        for _ in range(num_expenses):
            expense_date = datetime.now() - timedelta(days=day_offset)
            category, desc, min_amt, max_amt = random.choice(expense_categories)
            
            expense = models.Expense(
                store_id=store.id,
                category=category,
                description=desc,
                amount=random.randint(min_amt, max_amt),
                payment_mode=random.choice([models.PaymentMode.CASH, models.PaymentMode.CARD, models.PaymentMode.UPI]),
                vendor_name=f"Vendor {random.randint(1, 10)}",
                receipt_number=f"RCP{random.randint(10000, 99999)}",
                created_by=admin_user.id,
                expense_date=expense_date
            )
            db.add(expense)
            expenses_count += 1
    
    print(f"Created {expenses_count} expenses")
    
    # Create marketing campaigns
    print("\n=== Creating Marketing Campaigns ===")
    campaigns_data = [
        {
            'name': 'Diwali Mega Sale 2024',
            'description': 'Special Diwali offers with up to 50% discount',
            'campaign_type': models.CampaignType.WHATSAPP,
            'trigger_type': models.CampaignTrigger.FESTIVAL,
            'message_template': "🪔 Happy Diwali {customer_name}! ✨\n\nCelebrate with {discount}% OFF on all products!\nUse code: {code}\n\nOffer valid till {end_date}\n\n🎊 Shop Now!",
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
            'message_template': "🎉 Happy Birthday {customer_name}! 🎂\n\nGet {discount}% OFF!\nUse code: {code}\n\nValid for 7 days! 🎁",
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
    ]
    
    for campaign_data in campaigns_data:
        campaign = models.Campaign(
            **campaign_data,
            store_id=store.id,
            created_by=admin_user.id
        )
        db.add(campaign)
    
    print(f"Created {len(campaigns_data)} marketing campaigns")
    
    # Commit everything
    db.commit()
    
    print("\n" + "=" * 70)
    print("DATABASE INITIALIZATION COMPLETE!")
    print("=" * 70)
    print(f"\n Summary:")
    print(f"  - Store: {store.name}")
    print(f"  - Users: {len(users_data)}")
    print(f"  - Products: {len(products_list)}")
    print(f"  - Customers: {len(customers_list)}")
    print(f"  - Sales: {sales_count}")
    print(f"  - Expenses: {expenses_count}")
    print(f"  - Campaigns: {len(campaigns_data)}")
    print(f"\n Login Credentials:")
    print(f"  Admin: admin@example.com / admin123")
    print(f"  Manager: manager@example.com / manager123")
    print(f"  Sales: sales@example.com / sales123")
    print("\n" + "=" * 70 + "\n")
    
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    raise
finally:
    db.close()

