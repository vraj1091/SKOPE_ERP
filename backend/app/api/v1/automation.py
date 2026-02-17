from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.db.database import get_db
from app.db import models
from app.api.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter()

# ============ SCHEMAS ============

class AutomationRule(BaseModel):
    name: str
    trigger_type: str 
    condition: dict
    action_type: str
    action_config: dict
    is_active: bool = True

class MarketingInsight(BaseModel):
    type: str # 'opportunity', 'risk', 'achievement'
    priority: str # 'high', 'medium', 'low'
    title: str
    description: str
    potential_revenue: Optional[float] = None
    action_label: str
    action_endpoint: str

# ============ ADVANCED MARKETING INTELLIGENCE ============

@router.get("/marketing/insights", response_model=List[MarketingInsight])
def get_marketing_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Generates AI-driven marketing insights and opportunities.
    """
    insights = []
    
    # store filter
    filter_kwargs = {}
    if current_user.role != models.UserRole.SUPER_ADMIN:
        filter_kwargs['store_id'] = current_user.store_id

    # Insight 1: Churn Risk Detection (High Value Customers)
    ninety_days_ago = datetime.now() - timedelta(days=90)
    churn_risk_customers = db.query(models.Customer).filter(
        models.Customer.total_purchases > 50000, # High value
        models.Customer.id.notin_(
            db.query(models.Sale.customer_id).filter(models.Sale.sale_date >= ninety_days_ago)
        ),
        **filter_kwargs
    ).all()
    
    if churn_risk_customers:
        potential_loss = sum(c.total_purchases for c in churn_risk_customers) * 0.2 # Estimated future value lost
        insights.append({
            "type": "risk",
            "priority": "high",
            "title": f"{len(churn_risk_customers)} VIP Customers at Risk",
            "description": "Several high-spending customers haven't purchased in 90+ days.",
            "potential_revenue": potential_loss,
            "action_label": "Launch Win-Back Campaign",
            "action_endpoint": "/winback"
        })

    # Insight 2: Upcoming Birthdays Opportunity
    today = datetime.now()
    next_week = today + timedelta(days=7)
    
    birthday_customers = db.query(models.Customer).filter(
        extract('month', models.Customer.date_of_birth) == today.month,
        extract('day', models.Customer.date_of_birth) >= today.day,
        extract('day', models.Customer.date_of_birth) <= next_week.day,
        **filter_kwargs
    ).count()
    
    if birthday_customers > 0:
        insights.append({
            "type": "opportunity",
            "priority": "medium",
            "title": f"{birthday_customers} Birthdays This Week",
            "description": "Perfect time to send personalized birthday offers to build loyalty.",
            "potential_revenue": birthday_customers * 2000, # Avg spend estimate
            "action_label": "Schedule Birthday Emails",
            "action_endpoint": "/birthdays"
        })

    # Insight 3: Dead Stock Monetization
    dead_stock = db.query(models.Product).filter(
        models.Product.current_stock > 20,
        models.Product.updated_at < ninety_days_ago, # Hasn't moved recently
        **filter_kwargs
    ).all()
    
    if dead_stock:
        value = sum(p.current_stock * p.unit_price for p in dead_stock)
        insights.append({
            "type": "opportunity",
            "priority": "medium",
            "title": "Clearance Opportunity",
            "description": f"You have ₹{value:,.0f} tied up in slow-moving inventory.",
            "potential_revenue": value * 0.7, # 30% discount
            "action_label": "Create Clearance Sale",
            "action_endpoint": "/clearance"
        })

    return insights

# ============ CAMPAIGN GENERATORS ============

@router.post("/winback")
def launch_winback_campaign(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Auto-generates and schedules a win-back campaign for at-risk VIPs"""
    # Logic to create campaign in DB
    campaign = models.AdCampaignCreation(
        campaign_name=f"VIP Win-Back - {datetime.now().strftime('%b %Y')}",
        platform="email",
        objective="conversion",
        budget=0,
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=7),
        status="draft", # Created as draft for review
        store_id=current_user.store_id
    )
    db.add(campaign)
    db.commit()
    
    return {"message": "Win-back campaign draft created successfully", "campaign_id": campaign.id}
    
@router.post("/birthdays")
def launch_birthday_campaign(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Auto-generates monthly birthday campaign"""
    campaign = models.AdCampaignCreation(
        campaign_name=f"Birthday Special - {datetime.now().strftime('%B')}",
        platform="email",
        objective="brand_awareness",
        budget=0,
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=30),
        status="active",
        store_id=current_user.store_id
    )
    db.add(campaign)
    db.commit()
    
    return {"message": "Birthday automation activated for this month", "campaign_id": campaign.id}

# ============ SMART ALERTS SYSTEM (ENHANCED) ============

@router.get("/alerts/smart")
def get_smart_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Real-time business health monitoring"""
    
    alerts = []
    store_filter = {}
    if current_user.role != models.UserRole.SUPER_ADMIN:
        store_filter['store_id'] = current_user.store_id
    
    # 1. Critical Inventory
    critical_stock = db.query(models.Product).filter(
        models.Product.current_stock <= models.Product.minimum_stock * 0.5,
        models.Product.is_active == True,
        **store_filter
    ).limit(5).all()
    
    for p in critical_stock:
        alerts.append({
            "severity": "critical",
            "title": f"Low Stock: {p.name}",
            "message": f"Only {p.current_stock} left. Reorder immediately.",
            "action": "restock"
        })
        
    # 2. Daily Sales Velocity
    today = datetime.now().date()
    today_sales = db.query(func.sum(models.Sale.total_amount)).filter(
        func.date(models.Sale.sale_date) == today,
        **store_filter
    ).scalar() or 0
    
    avg_sales = 50000 # Placeholder - in real app would be calculated from history
    
    if today_sales > avg_sales * 1.5:
        alerts.append({
            "severity": "success",
            "title": "High Sales Velocity!",
            "message": f"Sales are 50% higher than average today (₹{today_sales:,.0f}).",
            "action": "view_report"
        })
    elif today_sales < avg_sales * 0.2 and datetime.now().hour > 18:
        alerts.append({
            "severity": "warning",
            "title": "Low Daily Sales",
            "message": "Sales are significantly lower than usual. Check store operations.",
            "action": "view_report"
        })

    return {"alerts": alerts}


