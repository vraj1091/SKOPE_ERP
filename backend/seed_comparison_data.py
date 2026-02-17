"""
Seed script to populate sales and expenses data for comparison testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
import random
from app.db.database import SessionLocal
from app.db.models import Sale, SaleItem, Product, Customer, Expense, Store, User
from sqlalchemy import func

def seed_comparison_data():
    db = SessionLocal()
    
    try:
        # Get the first store
        store = db.query(Store).first()
        if not store:
            print("No store found. Please run the main application first to create default store.")
            return
        
        # Get the first user
        user = db.query(User).first()
        if not user:
            print("No user found. Please run the main application first to create default user.")
            return
        
        # Get products
        products = db.query(Product).filter(Product.store_id == store.id).all()
        if not products:
            print("No products found. Creating sample products...")
            # Create sample products
            sample_products = [
                {"name": "Laptop", "sku": "LAP001", "unit_price": 45000, "cost_price": 35000, "gst_rate": 18, "current_stock": 50},
                {"name": "Mouse", "sku": "MOU001", "unit_price": 500, "cost_price": 300, "gst_rate": 18, "current_stock": 100},
                {"name": "Keyboard", "sku": "KEY001", "unit_price": 1500, "cost_price": 1000, "gst_rate": 18, "current_stock": 80},
                {"name": "Monitor", "sku": "MON001", "unit_price": 12000, "cost_price": 9000, "gst_rate": 18, "current_stock": 30},
                {"name": "Headphones", "sku": "HEA001", "unit_price": 2000, "cost_price": 1200, "gst_rate": 18, "current_stock": 60},
            ]
            
            for prod_data in sample_products:
                product = Product(
                    store_id=store.id,
                    name=prod_data["name"],
                    sku=prod_data["sku"],
                    category="Electronics",
                    unit_price=prod_data["unit_price"],
                    cost_price=prod_data["cost_price"],
                    gst_rate=prod_data["gst_rate"],
                    current_stock=prod_data["current_stock"],
                    minimum_stock=10,
                    warranty_months=12
                )
                db.add(product)
            
            db.commit()
            products = db.query(Product).filter(Product.store_id == store.id).all()
            print(f"Created {len(products)} sample products")
        
        # Get or create a customer
        customer = db.query(Customer).filter(Customer.store_id == store.id).first()
        if not customer:
            customer = Customer(
                store_id=store.id,
                name="Walk-in Customer",
                phone="9999999999",
                email="customer@example.com",
                address="Sample Address"
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
            print("Created sample customer")
        
        # Generate sales data for the last 90 days
        print("\nGenerating sales data for the last 90 days...")
        today = datetime.now()
        
        # Check if we already have recent sales data
        existing_sales = db.query(Sale).filter(
            Sale.store_id == store.id,
            Sale.sale_date >= today - timedelta(days=90)
        ).count()
        
        sales_created = existing_sales
        
        if existing_sales > 100:
            print(f"Found {existing_sales} existing sales records. Skipping sales generation...")
        else:
            for days_ago in range(90, -1, -1):
                sale_date = today - timedelta(days=days_ago)
                
                # Create 3-8 sales per day
                num_sales = random.randint(3, 8)
                
                for _ in range(num_sales):
                    # Random time during the day
                    hour = random.randint(9, 20)
                    minute = random.randint(0, 59)
                    sale_datetime = sale_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    
                    # Select 1-3 random products
                    num_items = random.randint(1, 3)
                    selected_products = random.sample(products, min(num_items, len(products)))
                    
                    subtotal = 0
                    gst_amount = 0
                    
                    for product in selected_products:
                        quantity = random.randint(1, 3)
                        item_total = product.unit_price * quantity
                        item_gst = (item_total * product.gst_rate) / 100
                        subtotal += item_total
                        gst_amount += item_gst
                    
                    discount = random.choice([0, 0, 0, 100, 200, 500])  # Most sales have no discount
                    total_amount = subtotal + gst_amount - discount
                    
                    # Random payment mode
                    payment_mode = random.choice(['cash', 'card', 'upi', 'qr_code'])
                    
                    # Create sale
                    invoice_number = f"INV{store.id}{sale_datetime.strftime('%Y%m%d')}{sales_created:04d}"
                    
                    sale = Sale(
                        invoice_number=invoice_number,
                        customer_id=customer.id,
                        store_id=store.id,
                        subtotal=subtotal,
                        gst_amount=gst_amount,
                        discount=discount,
                        total_amount=total_amount,
                        payment_mode=payment_mode,
                        sale_date=sale_datetime,
                        created_by=user.id
                    )
                    
                    db.add(sale)
                    db.flush()
                    
                    # Create sale items
                    for product in selected_products:
                        quantity = random.randint(1, 3)
                        item_total = product.unit_price * quantity
                        item_gst = (item_total * product.gst_rate) / 100
                        
                        sale_item = SaleItem(
                            sale_id=sale.id,
                            product_id=product.id,
                            quantity=quantity,
                            unit_price=product.unit_price,
                            gst_rate=product.gst_rate,
                            gst_amount=item_gst,
                            total_price=item_total + item_gst
                        )
                        db.add(sale_item)
                    
                    sales_created += 1
                    
                    if sales_created % 50 == 0:
                        db.commit()
                        print(f"Created {sales_created} sales...")
            
                db.commit()
                print(f"\n✅ Created {sales_created} sales records")
        
        # Generate expenses data
        print("\nGenerating expenses data for the last 90 days...")
        
        # Check if we already have recent expense data
        existing_expenses = db.query(Expense).filter(
            Expense.store_id == store.id,
            Expense.expense_date >= today - timedelta(days=90)
        ).count()
        
        expenses_created = existing_expenses
        
        if existing_expenses > 50:
            print(f"Found {existing_expenses} existing expense records. Skipping expense generation...")
        else:
            expense_categories = [
                "Rent", "Utilities", "Salaries", "Marketing", "Supplies", 
                "Maintenance", "Insurance", "Transportation"
            ]
            
            for days_ago in range(90, -1, -1):
                expense_date = today - timedelta(days=days_ago)
                
                # Create 1-3 expenses per day
                num_expenses = random.randint(1, 3)
                
                for _ in range(num_expenses):
                    category = random.choice(expense_categories)
                    
                    # Different expense ranges based on category
                    if category == "Rent":
                        amount = random.randint(15000, 25000)
                    elif category == "Salaries":
                        amount = random.randint(20000, 40000)
                    elif category == "Utilities":
                        amount = random.randint(2000, 5000)
                    else:
                        amount = random.randint(500, 5000)
                    
                    # Random payment mode for expenses
                    payment_mode = random.choice(['cash', 'card', 'upi'])
                    
                    expense = Expense(
                        store_id=store.id,
                        category=category,
                        amount=amount,
                        description=f"{category} expense",
                        payment_mode=payment_mode,
                        expense_date=expense_date,
                        created_by=user.id
                    )
                    
                    db.add(expense)
                    expenses_created += 1
                    
                    if expenses_created % 50 == 0:
                        db.commit()
                        print(f"Created {expenses_created} expenses...")
            
                db.commit()
                print(f"\n✅ Created {expenses_created} expense records")
        
        # Print summary
        print("\n" + "="*60)
        print("DATA SEEDING COMPLETE!")
        print("="*60)
        
        # Calculate some stats
        total_sales = db.query(func.sum(Sale.total_amount)).filter(Sale.store_id == store.id).scalar() or 0
        total_expenses = db.query(func.sum(Expense.amount)).filter(Expense.store_id == store.id).scalar() or 0
        total_profit = total_sales - total_expenses
        
        print(f"\nTotal Sales: ₹{total_sales:,.2f}")
        print(f"Total Expenses: ₹{total_expenses:,.2f}")
        print(f"Total Profit: ₹{total_profit:,.2f}")
        print(f"\nYou can now use the comparison graph in the dashboard!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting data seeding for comparison graphs...")
    seed_comparison_data()
