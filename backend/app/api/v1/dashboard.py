from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db.database import get_db
from app.db import models
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    store_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get comprehensive dashboard statistics combining sales, inventory, customers, and financial data"""
    
    try:
        # Determine store filter FIRST
        user_store_filter = None
        if current_user.role != models.UserRole.SUPER_ADMIN:
            user_store_filter = current_user.store_id
        elif store_id:
            user_store_filter = store_id

        # Write to debug log unconditionally
        with open("dashboard_trace.log", "a") as f:
            f.write(f"\n--- REQUEST AT {datetime.now()} ---\n")
            f.write(f"CurrentUser: {current_user.email} (ID: {current_user.id})\n")
            f.write(f"StoreFilter: {user_store_filter}\n")
            
            # Products
            product_query = db.query(models.Product)
            if user_store_filter:
                product_query = product_query.filter(models.Product.store_id == user_store_filter)
            total_products = product_query.count()
            f.write(f"Total Products Found: {total_products}\n")
        
        # Get today's date range
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        end_today = today + timedelta(days=1)
        
        # Get this month's date range
        start_month = datetime(today.year, today.month, 1)
        if today.month == 12:
            end_month = datetime(today.year + 1, 1, 1)
        else:
            end_month = datetime(today.year, today.month + 1, 1)
        
        # Build base query for sales
        sales_query = db.query(models.Sale)
        if user_store_filter:
            sales_query = sales_query.filter(models.Sale.store_id == user_store_filter)
        
        # Today's Sales
        today_sales = sales_query.filter(
            models.Sale.sale_date >= today,
            models.Sale.sale_date < end_today
        ).all()
        
        today_revenue = sum(sale.total_amount for sale in today_sales) if today_sales else 0
        today_transactions = len(today_sales)
        
        # Monthly Sales
        month_sales = sales_query.filter(
            models.Sale.sale_date >= start_month,
            models.Sale.sale_date < end_month
        ).all()
        
        month_revenue = sum(sale.total_amount for sale in month_sales) if month_sales else 0
        month_sales_count = len(month_sales)
        
        # Products and Inventory
        product_query = db.query(models.Product)
        if user_store_filter:
            product_query = product_query.filter(models.Product.store_id == user_store_filter)
        
        total_products = product_query.count()
        low_stock_count = product_query.filter(
            models.Product.current_stock <= models.Product.minimum_stock
        ).count()
        
        # Customers
        customer_query = db.query(models.Customer)
        if user_store_filter:
            customer_query = customer_query.filter(models.Customer.store_id == user_store_filter)
        
        total_customers = customer_query.count()
        
        # Users (only for super admin)
        if current_user.role == models.UserRole.SUPER_ADMIN:
            total_users = db.query(models.User).count()
        else:
            total_users = db.query(models.User).filter(
                models.User.store_id == user_store_filter
            ).count()
        
        # Monthly Expenses - with try/except in case table doesn't exist
        month_expenses = 0
        today_expenses = 0
        try:
            expense_query = db.query(models.Expense)
            if user_store_filter:
                expense_query = expense_query.filter(models.Expense.store_id == user_store_filter)
            
            month_expenses_data = expense_query.filter(
                models.Expense.expense_date >= start_month,
                models.Expense.expense_date < end_month
            ).all()
            
            month_expenses = sum(expense.amount for expense in month_expenses_data) if month_expenses_data else 0
            
            # Today's expenses
            today_expenses_data = expense_query.filter(
                models.Expense.expense_date >= today,
                models.Expense.expense_date < end_today
            ).all()
            
            today_expenses = sum(expense.amount for expense in today_expenses_data) if today_expenses_data else 0
        except Exception as e:
            print(f"Expense query error: {e}")
            month_expenses = 0
            today_expenses = 0
        
        # Calculate profit
        month_profit = month_revenue - month_expenses
        today_profit = today_revenue - today_expenses
        
        return {
            # Debug Stats
            "server_time": str(datetime.now()),
            "debug_store_filter": user_store_filter,
            "debug_user": current_user.email,
            
            # Today's Stats
            "today_sales": today_transactions,
            "today_revenue": today_revenue,
            "today_expenses": today_expenses,
            "today_profit": today_profit,
            
            # Monthly Stats
            "month_revenue": month_revenue,
            "month_sales_count": month_sales_count,
            "month_expenses": month_expenses,
            "month_profit": month_profit,
            
            # Entity Counts
            "total_products": total_products,
            "low_stock_count": low_stock_count,
            "total_customers": total_customers,
            "total_users": total_users,
            
            # Calculated metrics
            "average_transaction_value": month_revenue / month_sales_count if month_sales_count > 0 else 0,
            "profit_margin": (month_profit / month_revenue * 100) if month_revenue > 0 else 0,
        }
    except Exception as e:
        print(f"Dashboard stats error: {e}")
        import traceback
        error_trace = traceback.format_exc()
        print(error_trace)
        
        # Write to debug log
        with open("dashboard_debug.log", "a") as f:
            f.write(f"\n\n--- ERROR AT {datetime.now()} ---\n")
            f.write(f"User: {current_user.email}, Role: {current_user.role}, Store: {current_user.store_id}\n")
            f.write(f"Store Filter: {user_store_filter}\n")
            f.write(str(e))
            f.write("\n")
            f.write(error_trace)

        # Return 0s but with error indication in log
        return {
            "today_sales": 0,
            "today_revenue": 0,
            "today_expenses": 0,
            "today_profit": 0,
            "month_revenue": 0,
            "month_sales_count": 0,
            "month_expenses": 0,
            "month_profit": 0,
            "total_products": 0,
            "low_stock_count": 0,
            "total_customers": 0,
            "total_users": 0,
            "average_transaction_value": 0,
            "profit_margin": 0,
        }
