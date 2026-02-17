from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import List, Optional
from app.db.database import get_db
from app.db import models
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/daily-comparison")
def get_daily_comparison(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    store_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get day-wise comparison of revenue and profit"""
    
    try:
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0)
        end = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Determine store filter
        user_store_filter = None
        if current_user.role != models.UserRole.SUPER_ADMIN:
            user_store_filter = current_user.store_id
        elif store_id:
            user_store_filter = store_id
        
        # Build sales query
        sales_query = db.query(models.Sale)
        if user_store_filter:
            sales_query = sales_query.filter(models.Sale.store_id == user_store_filter)
        
        sales = sales_query.filter(
            models.Sale.sale_date >= start,
            models.Sale.sale_date <= end
        ).all()
        
        # Build expenses query
        expense_query = db.query(models.Expense)
        if user_store_filter:
            expense_query = expense_query.filter(models.Expense.store_id == user_store_filter)
        
        expenses = expense_query.filter(
            models.Expense.expense_date >= start,
            models.Expense.expense_date <= end
        ).all()
        
        # Group by date
        daily_data = {}
        current_date = start
        while current_date <= end:
            date_str = current_date.strftime("%Y-%m-%d")
            daily_data[date_str] = {
                "date": date_str,
                "revenue": 0,
                "expenses": 0,
                "profit": 0,
                "transactions": 0
            }
            current_date += timedelta(days=1)
        
        # Aggregate sales
        for sale in sales:
            date_str = sale.sale_date.strftime("%Y-%m-%d")
            if date_str in daily_data:
                daily_data[date_str]["revenue"] += float(sale.total_amount)
                daily_data[date_str]["transactions"] += 1
        
        # Aggregate expenses
        for expense in expenses:
            date_str = expense.expense_date.strftime("%Y-%m-%d")
            if date_str in daily_data:
                daily_data[date_str]["expenses"] += float(expense.amount)
        
        # Calculate profit
        for date_str in daily_data:
            daily_data[date_str]["profit"] = daily_data[date_str]["revenue"] - daily_data[date_str]["expenses"]
        
        return {
            "start_date": start_date,
            "end_date": end_date,
            "data": list(daily_data.values())
        }
    
    except Exception as e:
        print(f"Daily comparison error: {e}")
        return {
            "start_date": start_date,
            "end_date": end_date,
            "data": [],
            "error": str(e)
        }


@router.get("/yearly-comparison")
def get_yearly_comparison(
    years: str = Query(..., description="Comma-separated years to compare (e.g., '2024,2025')"),
    store_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get yearly comparison of revenue and profit by month"""
    
    try:
        # Parse years
        year_list = [int(y.strip()) for y in years.split(",")]
        
        # Determine store filter
        user_store_filter = None
        if current_user.role != models.UserRole.SUPER_ADMIN:
            user_store_filter = current_user.store_id
        elif store_id:
            user_store_filter = store_id
        
        result = {}
        
        for year in year_list:
            # Build sales query
            sales_query = db.query(models.Sale)
            if user_store_filter:
                sales_query = sales_query.filter(models.Sale.store_id == user_store_filter)
            
            sales = sales_query.filter(
                extract('year', models.Sale.sale_date) == year
            ).all()
            
            # Build expenses query
            expense_query = db.query(models.Expense)
            if user_store_filter:
                expense_query = expense_query.filter(models.Expense.store_id == user_store_filter)
            
            expenses = expense_query.filter(
                extract('year', models.Expense.expense_date) == year
            ).all()
            
            # Group by month
            monthly_data = {}
            for month in range(1, 13):
                month_name = datetime(year, month, 1).strftime("%b")
                monthly_data[month] = {
                    "month": month_name,
                    "revenue": 0,
                    "expenses": 0,
                    "profit": 0,
                    "transactions": 0
                }
            
            # Aggregate sales
            for sale in sales:
                month = sale.sale_date.month
                monthly_data[month]["revenue"] += float(sale.total_amount)
                monthly_data[month]["transactions"] += 1
            
            # Aggregate expenses
            for expense in expenses:
                month = expense.expense_date.month
                monthly_data[month]["expenses"] += float(expense.amount)
            
            # Calculate profit
            for month in monthly_data:
                monthly_data[month]["profit"] = monthly_data[month]["revenue"] - monthly_data[month]["expenses"]
            
            result[str(year)] = list(monthly_data.values())
        
        return {
            "years": year_list,
            "data": result
        }
    
    except Exception as e:
        print(f"Yearly comparison error: {e}")
        return {
            "years": [],
            "data": {},
            "error": str(e)
        }


@router.get("/monthly-comparison")
def get_monthly_comparison(
    year: int = Query(..., description="Year to compare"),
    months: str = Query(..., description="Comma-separated months to compare (e.g., '1,2,3')"),
    store_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get monthly comparison of revenue and profit by day"""
    
    try:
        # Parse months
        month_list = [int(m.strip()) for m in months.split(",")]
        
        # Determine store filter
        user_store_filter = None
        if current_user.role != models.UserRole.SUPER_ADMIN:
            user_store_filter = current_user.store_id
        elif store_id:
            user_store_filter = store_id
        
        result = {}
        
        for month in month_list:
            # Get month date range
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(seconds=1)
            
            # Build sales query
            sales_query = db.query(models.Sale)
            if user_store_filter:
                sales_query = sales_query.filter(models.Sale.store_id == user_store_filter)
            
            sales = sales_query.filter(
                models.Sale.sale_date >= start_date,
                models.Sale.sale_date <= end_date
            ).all()
            
            # Build expenses query
            expense_query = db.query(models.Expense)
            if user_store_filter:
                expense_query = expense_query.filter(models.Expense.store_id == user_store_filter)
            
            expenses = expense_query.filter(
                models.Expense.expense_date >= start_date,
                models.Expense.expense_date <= end_date
            ).all()
            
            # Group by day
            days_in_month = (end_date - start_date).days + 1
            daily_data = {}
            for day in range(1, days_in_month + 1):
                daily_data[day] = {
                    "day": day,
                    "revenue": 0,
                    "expenses": 0,
                    "profit": 0,
                    "transactions": 0
                }
            
            # Aggregate sales
            for sale in sales:
                day = sale.sale_date.day
                daily_data[day]["revenue"] += float(sale.total_amount)
                daily_data[day]["transactions"] += 1
            
            # Aggregate expenses
            for expense in expenses:
                day = expense.expense_date.day
                daily_data[day]["expenses"] += float(expense.amount)
            
            # Calculate profit
            for day in daily_data:
                daily_data[day]["profit"] = daily_data[day]["revenue"] - daily_data[day]["expenses"]
            
            month_name = datetime(year, month, 1).strftime("%B")
            result[month_name] = list(daily_data.values())
        
        return {
            "year": year,
            "months": month_list,
            "data": result
        }
    
    except Exception as e:
        print(f"Monthly comparison error: {e}")
        return {
            "year": year,
            "months": [],
            "data": {},
            "error": str(e)
        }
