from app.db.database import SessionLocal
from app.db import models
from datetime import datetime
import random

db = SessionLocal()

print("Injecting FRESH sales for TODAY...")

# Get Store 1
store = db.query(models.Store).first()
admin = db.query(models.User).filter(models.User.email == "admin@skpoe.com").first()
products = db.query(models.Product).filter(models.Product.store_id == store.id).all()

if not products:
    print("No products found! Creating dummy product.")
    p = models.Product(
        sku="DUMMY001", name="Dummy Product", description="Test", 
        category="Test", brand="Test", unit_price=1000, cost_price=800, 
        gst_rate=18, current_stock=100, minimum_stock=10, store_id=store.id, is_active=True
    )
    db.add(p)
    db.commit()
    products = [p]

for i in range(5):
    sale = models.Sale(
        invoice_number=f"INV-NOW-{random.randint(1000,9999)}",
        total_amount=random.randint(5000, 15000),
        sale_date=datetime.now(),
        payment_status="completed",
        payment_mode="cash",
        store_id=store.id,
        created_by=admin.id
    )
    db.add(sale)
    print(f"Added sale: {sale.invoice_number}")

db.commit()
print("Success! Added 5 sales for today.")
db.close()
