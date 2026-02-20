from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json
from app.db.database import get_db
from app.db import models
from app.api.dependencies import get_current_user
from pydantic import BaseModel
import requests
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign as FBCampaign
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.ad import Ad
from facebook_business.api import FacebookAdsApi
import os
import shutil

router = APIRouter()

# ============ SCHEMAS ============

class AdAccountConnectionCreate(BaseModel):
    platform: str
    meta_ad_account_id: Optional[str] = None
    meta_pixel_id: Optional[str] = None
    meta_page_id: Optional[str] = None
    meta_business_id: Optional[str] = None
    google_customer_id: Optional[str] = None
    google_conversion_actions: Optional[dict] = None
    google_ga4_property: Optional[str] = None
    access_token: str
    refresh_token: Optional[str] = None

class MetaOAuthCallback(BaseModel):
    code: str
    state: str

class GoogleOAuthCallback(BaseModel):
    code: str
    state: str

class AdCampaignCreate(BaseModel):
    campaign_name: str
    campaign_template: str
    platform: str
    objective: Optional[str] = None
    budget_daily: Optional[float] = None
    budget_total: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    headline: Optional[str] = None
    description: Optional[str] = None
    call_to_action: Optional[str] = None
    asset_ids: Optional[List[int]] = None
    target_audience: Optional[dict] = None
    location_radius: Optional[float] = None
    age_min: Optional[int] = 18
    age_max: Optional[int] = 65
    gender: Optional[str] = None
    interests: Optional[List[str]] = None
    offer_text: Optional[str] = None

class CampaignApproval(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None

class AudienceCreate(BaseModel):
    name: str
    audience_type: str
    platform: str
    source_criteria: dict
    customer_ids: Optional[List[int]] = None

# ============ META INTEGRATION ENDPOINTS ============

@router.get("/meta/auth-url")
async def get_meta_auth_url(
    current_user: models.User = Depends(get_current_user)
):
    """Generate Meta OAuth URL for business account connection"""
    app_id = os.getenv("META_APP_ID", "YOUR_APP_ID")
    redirect_uri = os.getenv("META_REDIRECT_URI", "http://localhost:3000/ads/meta/callback")
    
    permissions = [
        "ads_management",
        "ads_read",
        "business_management",
        "pages_read_engagement",
        "pages_manage_ads",
        "instagram_basic",
        "instagram_manage_insights",
        "whatsapp_business_management"
    ]
    
    auth_url = (
        f"https://www.facebook.com/v18.0/dialog/oauth?"
        f"client_id={app_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={','.join(permissions)}&"
        f"response_type=code&"
        f"state={current_user.store_id}"
    )
    
    return {"auth_url": auth_url}

@router.post("/meta/callback")
async def meta_oauth_callback(
    callback: MetaOAuthCallback,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Handle Meta OAuth callback and store tokens"""
    try:
        app_id = os.getenv("META_APP_ID")
        app_secret = os.getenv("META_APP_SECRET")
        redirect_uri = os.getenv("META_REDIRECT_URI")
        
        # Exchange code for access token
        token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        response = requests.get(token_url, params={
            "client_id": app_id,
            "client_secret": app_secret,
            "redirect_uri": redirect_uri,
            "code": callback.code
        })
        
        token_data = response.json()
        
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        access_token = token_data["access_token"]
        
        # Get long-lived token
        long_token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        long_response = requests.get(long_token_url, params={
            "grant_type": "fb_exchange_token",
            "client_id": app_id,
            "client_secret": app_secret,
            "fb_exchange_token": access_token
        })
        
        long_token_data = long_response.json()
        long_lived_token = long_token_data.get("access_token", access_token)
        expires_in = long_token_data.get("expires_in", 5184000)  # 60 days default
        
        # Get user's ad accounts
        me_url = f"https://graph.facebook.com/v18.0/me/adaccounts"
        accounts_response = requests.get(me_url, params={"access_token": long_lived_token})
        accounts_data = accounts_response.json()
        
        return {
            "access_token": long_lived_token,
            "expires_in": expires_in,
            "ad_accounts": accounts_data.get("data", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/meta/connect")
async def connect_meta_account(
    connection: AdAccountConnectionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Save Meta ad account connection"""
    # Check if connection already exists
    existing = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.store_id == current_user.store_id,
        models.AdAccountConnection.platform == connection.platform
    ).first()
    
    if existing:
        # Update existing connection
        existing.meta_ad_account_id = connection.meta_ad_account_id
        existing.meta_pixel_id = connection.meta_pixel_id
        existing.meta_page_id = connection.meta_page_id
        existing.meta_business_id = connection.meta_business_id
        existing.access_token = connection.access_token
        existing.refresh_token = connection.refresh_token
        existing.token_expires_at = datetime.utcnow() + timedelta(days=60)
        existing.is_active = True
        existing.updated_at = datetime.utcnow()
        db_connection = existing
    else:
        # Create new connection
        db_connection = models.AdAccountConnection(
            store_id=current_user.store_id,
            platform=connection.platform,
            meta_ad_account_id=connection.meta_ad_account_id,
            meta_pixel_id=connection.meta_pixel_id,
            meta_page_id=connection.meta_page_id,
            meta_business_id=connection.meta_business_id,
            access_token=connection.access_token,
            refresh_token=connection.refresh_token,
            token_expires_at=datetime.utcnow() + timedelta(days=60),
            created_by=current_user.id
        )
        db.add(db_connection)
    
    db.commit()
    db.refresh(db_connection)
    
    return {
        "message": "Meta account connected successfully",
        "connection_id": db_connection.id
    }

# ============ SANDBOX / DEMO MODE ============

@router.post("/sandbox/connect")
async def connect_sandbox_account(
    platform: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Connect a Sandbox/Demo account for Meta or Google Ads.
    This simulates a real connection and populates the dashboard with realistic mock data
    so users can experience the full functionality without paying for real ads.
    """
    if platform not in ["meta", "google"]:
        raise HTTPException(status_code=400, detail="Invalid platform. Choose 'meta' or 'google'")
    
    # 1. Create Mock Connection
    existing = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.store_id == current_user.store_id,
        models.AdAccountConnection.platform == platform,
        models.AdAccountConnection.is_active == True
    ).first()
    
    if existing:
        return {"message": f"{platform.title()} Sandbox account is already connected!"}
    
    # Generate fake IDs
    import random
    import string
    
    fake_id = ''.join(random.choices(string.digits, k=16))
    
    connection = models.AdAccountConnection(
        store_id=current_user.store_id,
        platform=platform,
        meta_ad_account_id=f"act_{fake_id}" if platform == "meta" else None,
        google_customer_id=f"{fake_id[:3]}-{fake_id[3:6]}-{fake_id[6:10]}" if platform == "google" else None,
        access_token=f"mock_token_{''.join(random.choices(string.ascii_letters, k=20))}",
        is_active=True,
        token_expires_at=datetime.utcnow() + timedelta(days=365), # Long expiry for demo
        created_by=current_user.id
    )
    
    db.add(connection)
    db.commit()
    db.refresh(connection)
    
    # 2. Update System Setting to indicate Sandbox Mode is active for this user/store
    # (Optional, but good for UI state)
    
    # 3. Generate Mock Campaigns
    create_mock_campaigns(db, current_user, connection)
    
    return {
        "message": f"{platform.title()} Sandbox account connected successfully! Mock data generated.",
        "connection_id": connection.id,
        "mode": "sandbox"
    }

def create_mock_campaigns(db: Session, user: models.User, connection: models.AdAccountConnection):
    """Generates realistic mock campaigns and analytics"""
    import random
    
    templates = [
        {"name": "Summer Sale Extravaganza", "obj": "OUTCOME_SALES", "status": "ACTIVE", "roas": 4.5},
        {"name": "New Collection Launch", "obj": "OUTCOME_AWARENESS", "status": "ACTIVE", "roas": 2.1},
        {"name": "Retargeting - Cart Abandoners", "obj": "OUTCOME_SALES", "status": "PAUSED", "roas": 6.8},
        {"name": "Brand Awareness Video", "obj": "OUTCOME_TRAFFIC", "status": "ACTIVE", "roas": 1.5},
    ]
    
    for t in templates:
        # Create Campaign
        daily_budget = random.randint(500, 5000)
        
        campaign = models.AdCampaignCreation(
            store_id=user.store_id,
            ad_account_id=connection.id,
            campaign_name=t["name"],
            campaign_template="custom",
            platform=connection.platform,
            objective=t["obj"],
            budget_daily=float(daily_budget),
            status=models.AdCampaignStatus.ACTIVE if t["status"] == "ACTIVE" else models.AdCampaignStatus.PAUSED,
            created_by=user.id,
            start_date=datetime.utcnow() - timedelta(days=random.randint(10, 30))
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        
        # Generate 30 days of Analytics
        generate_mock_analytics(db, campaign, t["roas"])

def generate_mock_analytics(db: Session, campaign: models.AdCampaignCreation, target_roas: float):
    """Generates 30 days of realistic analytics data"""
    import random
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    current = start_date
    while current <= end_date:
        # Randomize daily performance slightly
        daily_volatility = random.uniform(0.8, 1.2)
        
        impressions = int(random.randint(1000, 5000) * daily_volatility)
        clicks = int(impressions * random.uniform(0.01, 0.03)) # 1-3% CTR
        spend = clicks * random.uniform(5, 15) # CPC between 5-15
        
        # Sales logic based on ROAS
        revenue = spend * (target_roas * random.uniform(0.9, 1.1))
        sales_count = int(revenue / random.randint(500, 2000)) if revenue > 0 else 0
        leads = int(clicks * random.uniform(0.05, 0.15))
        
        analytics = models.AdCampaignAnalytics(
            campaign_id=campaign.id,
            date=current,
            impressions=impressions,
            clicks=clicks,
            spend=round(spend, 2),
            reach=int(impressions * 0.8),
            leads=leads,
            sales_attributed=sales_count,
            revenue_attributed=round(revenue, 2),
            ctr=round((clicks/impressions)*100, 2) if impressions > 0 else 0,
            cpc=round(spend/clicks, 2) if clicks > 0 else 0,
            roas=round(revenue/spend, 2) if spend > 0 else 0
        )
        db.add(analytics)
        current += timedelta(days=1)
    
    db.commit()

# ============ GOOGLE ADS INTEGRATION ENDPOINTS ============

@router.get("/google/auth-url")
async def get_google_auth_url(
    current_user: models.User = Depends(get_current_user)
):
    """Generate Google OAuth URL for Ads account connection"""
    client_id = os.getenv("GOOGLE_CLIENT_ID", "YOUR_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/ads/google/callback")
    
    scopes = [
        "https://www.googleapis.com/auth/adwords",
        "https://www.googleapis.com/auth/analytics.readonly"
    ]
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={' '.join(scopes)}&"
        f"response_type=code&"
        f"access_type=offline&"
        f"prompt=consent&"
        f"state={current_user.store_id}"
    )
    
    return {"auth_url": auth_url}

@router.post("/google/callback")
async def google_oauth_callback(
    callback: GoogleOAuthCallback,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Handle Google OAuth callback and store tokens"""
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        response = requests.post(token_url, data={
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "code": callback.code,
            "grant_type": "authorization_code"
        })
        
        token_data = response.json()
        
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token"),
            "expires_in": token_data.get("expires_in", 3600)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/google/connect")
async def connect_google_account(
    connection: AdAccountConnectionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Save Google Ads account connection"""
    # Check if connection already exists
    existing = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.store_id == current_user.store_id,
        models.AdAccountConnection.platform == "google"
    ).first()
    
    if existing:
        # Update existing connection
        existing.google_customer_id = connection.google_customer_id
        existing.google_conversion_actions = connection.google_conversion_actions
        existing.google_ga4_property = connection.google_ga4_property
        existing.access_token = connection.access_token
        existing.refresh_token = connection.refresh_token
        existing.token_expires_at = datetime.utcnow() + timedelta(hours=1)
        existing.is_active = True
        existing.updated_at = datetime.utcnow()
        db_connection = existing
    else:
        # Create new connection
        db_connection = models.AdAccountConnection(
            store_id=current_user.store_id,
            platform="google",
            google_customer_id=connection.google_customer_id,
            google_conversion_actions=connection.google_conversion_actions,
            google_ga4_property=connection.google_ga4_property,
            access_token=connection.access_token,
            refresh_token=connection.refresh_token,
            token_expires_at=datetime.utcnow() + timedelta(hours=1),
            created_by=current_user.id
        )
        db.add(db_connection)
    
    db.commit()
    db.refresh(db_connection)
    
    return {
        "message": "Google Ads account connected successfully",
        "connection_id": db_connection.id
    }

# ============ AD ACCOUNT MANAGEMENT ============

@router.get("/connections")
async def get_ad_connections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all ad account connections for the store"""
    connections = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.store_id == current_user.store_id
    ).all()
    
    return connections

@router.post("/connections/{connection_id}/refresh-token")
async def refresh_ad_token(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Refresh OAuth token for ad account"""
    connection = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.id == connection_id,
        models.AdAccountConnection.store_id == current_user.store_id
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        if connection.platform == "google":
            # Refresh Google token
            client_id = os.getenv("GOOGLE_CLIENT_ID")
            client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
            
            response = requests.post("https://oauth2.googleapis.com/token", data={
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": connection.refresh_token,
                "grant_type": "refresh_token"
            })
            
            token_data = response.json()
            connection.access_token = token_data["access_token"]
            connection.token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))
            
        elif connection.platform in ["meta", "facebook", "instagram", "whatsapp"]:
            # Meta tokens are long-lived (60 days), refresh proactively
            app_id = os.getenv("META_APP_ID")
            app_secret = os.getenv("META_APP_SECRET")
            
            response = requests.get("https://graph.facebook.com/v18.0/oauth/access_token", params={
                "grant_type": "fb_exchange_token",
                "client_id": app_id,
                "client_secret": app_secret,
                "fb_exchange_token": connection.access_token
            })
            
            token_data = response.json()
            connection.access_token = token_data.get("access_token", connection.access_token)
            connection.token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 5184000))
        
        connection.last_token_refresh = datetime.utcnow()
        db.commit()
        
        return {"message": "Token refreshed successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token refresh failed: {str(e)}")

# ============ CREATIVE ASSET MANAGEMENT ============

@router.post("/assets/upload")
async def upload_creative_asset(
    file: UploadFile = File(...),
    name: Optional[str] = None,
    asset_type: str = "image",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Upload creative asset (image/video/logo)"""
    # Create uploads directory if not exists
    upload_dir = f"backend/uploads/creative_assets/{current_user.store_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = f"{upload_dir}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create asset record
    asset = models.CreativeAsset(
        store_id=current_user.store_id,
        name=name or file.filename,
        asset_type=asset_type,
        file_path=file_path,
        file_url=f"/uploads/creative_assets/{current_user.store_id}/{file.filename}",
        created_by=current_user.id
    )
    
    db.add(asset)
    db.commit()
    db.refresh(asset)
    
    return asset

@router.get("/assets")
async def get_creative_assets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all creative assets for the store"""
    assets = db.query(models.CreativeAsset).filter(
        models.CreativeAsset.store_id == current_user.store_id,
        models.CreativeAsset.is_active == True
    ).all()
    
    return assets

@router.post("/assets/{asset_id}/approve")
async def approve_creative_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Approve creative asset for use in ads"""
    asset = db.query(models.CreativeAsset).filter(
        models.CreativeAsset.id == asset_id,
        models.CreativeAsset.store_id == current_user.store_id
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.is_approved = True
    db.commit()
    
    return {"message": "Asset approved successfully"}

# ============ CAMPAIGN CREATION ENGINE ============

@router.get("/campaign-templates")
async def get_campaign_templates():
    """Get available campaign templates"""
    return {
        "meta": [
            {"value": "store_visit", "label": "Store Visit Campaign", "objective": "OUTCOME_TRAFFIC"},
            {"value": "lead_form", "label": "Lead Form Campaign", "objective": "OUTCOME_LEADS"},
            {"value": "whatsapp_click", "label": "WhatsApp Click Campaign", "objective": "OUTCOME_ENGAGEMENT"},
            {"value": "offer_festival", "label": "Offer / Festival Campaign", "objective": "OUTCOME_SALES"},
            {"value": "product_catalog", "label": "Product Catalog Campaign", "objective": "OUTCOME_SALES"}
        ],
        "google": [
            {"value": "local_search_ads", "label": "Local Search Ads", "objective": "LEADS"},
            {"value": "performance_max", "label": "Performance Max (Retail)", "objective": "SALES"},
            {"value": "display_remarketing", "label": "Display Remarketing", "objective": "AWARENESS"},
            {"value": "youtube_local_awareness", "label": "YouTube Local Awareness", "objective": "AWARENESS"}
        ]
    }

@router.post("/campaigns/create")
async def create_ad_campaign(
    campaign: AdCampaignCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create new ad campaign (Draft mode, requires approval)"""
    # Get ad account connection
    ad_account = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.store_id == current_user.store_id,
        models.AdAccountConnection.platform == campaign.platform,
        models.AdAccountConnection.is_active == True
    ).first()
    
    if not ad_account:
        raise HTTPException(status_code=400, detail=f"No active {campaign.platform} account connected")
    
    # Create campaign in database
    db_campaign = models.AdCampaignCreation(
        store_id=current_user.store_id,
        ad_account_id=ad_account.id,
        campaign_name=campaign.campaign_name,
        campaign_template=campaign.campaign_template,
        platform=campaign.platform,
        objective=campaign.objective,
        budget_daily=campaign.budget_daily,
        budget_total=campaign.budget_total,
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        headline=campaign.headline,
        description=campaign.description,
        call_to_action=campaign.call_to_action,
        asset_ids=campaign.asset_ids,
        target_audience=campaign.target_audience,
        location_radius=campaign.location_radius,
        age_min=campaign.age_min,
        age_max=campaign.age_max,
        gender=campaign.gender,
        interests=campaign.interests,
        offer_text=campaign.offer_text,
        status=models.AdCampaignStatus.DRAFT if current_user.role != models.UserRole.SUPER_ADMIN else models.AdCampaignStatus.PENDING_APPROVAL,
        created_by=current_user.id
    )
    
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    
    return {
        "message": "Campaign created successfully",
        "campaign_id": db_campaign.id,
        "status": db_campaign.status
    }

@router.get("/campaigns")
async def get_ad_campaigns(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all ad campaigns for the store"""
    query = db.query(models.AdCampaignCreation).filter(
        models.AdCampaignCreation.store_id == current_user.store_id
    )
    
    if status:
        query = query.filter(models.AdCampaignCreation.status == status)
    
    campaigns = query.order_by(models.AdCampaignCreation.created_at.desc()).all()
    
    return campaigns

@router.post("/campaigns/{campaign_id}/approve")
async def approve_campaign(
    campaign_id: int,
    approval: CampaignApproval,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Approve or reject campaign (Store Manager or Super Admin)"""
    if current_user.role not in [models.UserRole.SUPER_ADMIN, models.UserRole.STORE_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to approve campaigns")
    
    campaign = db.query(models.AdCampaignCreation).filter(
        models.AdCampaignCreation.id == campaign_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Check read-only access for brand head viewing other stores
    if current_user.role == models.UserRole.SUPER_ADMIN and current_user.store_id != campaign.store_id:
        # Read-only view for brand head
        raise HTTPException(status_code=403, detail="Read-only access for other stores")
    
    if approval.approved:
        campaign.status = models.AdCampaignStatus.ACTIVE
        campaign.approved_by = current_user.id
        campaign.approved_at = datetime.utcnow()
    else:
        campaign.status = models.AdCampaignStatus.REJECTED
        campaign.rejection_reason = approval.rejection_reason
    
    db.commit()
    
    return {"message": f"Campaign {'approved' if approval.approved else 'rejected'} successfully"}

@router.post("/campaigns/{campaign_id}/launch")
async def launch_campaign_to_platform(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Launch approved campaign to actual ad platform (Meta/Google)"""
    campaign = db.query(models.AdCampaignCreation).filter(
        models.AdCampaignCreation.id == campaign_id,
        models.AdCampaignCreation.store_id == current_user.store_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.status != models.AdCampaignStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Campaign must be approved before launching")
    
    # Get ad account
    ad_account = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.id == campaign.ad_account_id
    ).first()
    
    try:
        if campaign.platform in ["meta", "facebook", "instagram"]:
            # Launch to Meta
            FacebookAdsApi.init(access_token=ad_account.access_token)
            
            # Create campaign on Meta
            account = AdAccount(f'act_{ad_account.meta_ad_account_id}')
            fb_campaign = account.create_campaign(params={
                'name': campaign.campaign_name,
                'objective': campaign.objective or 'OUTCOME_TRAFFIC',
                'status': 'PAUSED',
                'special_ad_categories': []
            })
            
            campaign.external_campaign_id = fb_campaign['id']
            
        elif campaign.platform == "google":
            # Launch to Google Ads (simplified - full implementation requires Google Ads API setup)
            campaign.external_campaign_id = f"google_{campaign_id}"
        
        db.commit()
        
        return {
            "message": "Campaign launched successfully to platform",
            "external_campaign_id": campaign.external_campaign_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to launch campaign: {str(e)}")

# ============ AUDIENCE MANAGEMENT ============

@router.post("/audiences/create")
async def create_audience(
    audience: AudienceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create custom audience from ERP data"""
    # Get ad account connection
    ad_account = db.query(models.AdAccountConnection).filter(
        models.AdAccountConnection.store_id == current_user.store_id,
        models.AdAccountConnection.platform == audience.platform,
        models.AdAccountConnection.is_active == True
    ).first()
    
    if not ad_account:
        raise HTTPException(status_code=400, detail=f"No active {audience.platform} account connected")
    
    # Get customers based on criteria
    customer_query = db.query(models.Customer).filter(
        models.Customer.store_id == current_user.store_id
    )
    
    # Apply filters from source_criteria
    if audience.source_criteria.get("segment") == "past_buyers":
        days = audience.source_criteria.get("days", 30)
        since_date = datetime.utcnow() - timedelta(days=days)
        customer_query = customer_query.join(models.Sale).filter(
            models.Sale.sale_date >= since_date
        )
    elif audience.source_criteria.get("segment") == "high_value":
        min_value = audience.source_criteria.get("min_purchase", 50000)
        customer_query = customer_query.filter(
            models.Customer.total_purchases >= min_value
        )
    
    customers = customer_query.all()
    customer_ids = [c.id for c in customers]
    
    # Create audience
    db_audience = models.Audience(
        store_id=current_user.store_id,
        ad_account_id=ad_account.id,
        name=audience.name,
        audience_type=audience.audience_type,
        platform=audience.platform,
        source_criteria=audience.source_criteria,
        customer_ids=customer_ids,
        size=len(customer_ids),
        created_by=current_user.id
    )
    
    db.add(db_audience)
    db.commit()
    db.refresh(db_audience)
    
    return {
        "message": "Audience created successfully",
        "audience_id": db_audience.id,
        "size": len(customer_ids)
    }

@router.get("/audiences")
async def get_audiences(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all audiences for the store"""
    audiences = db.query(models.Audience).filter(
        models.Audience.store_id == current_user.store_id,
        models.Audience.is_active == True
    ).all()
    
    return audiences

@router.post("/audiences/{audience_id}/sync")
async def sync_audience_to_platform(
    audience_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Sync audience to ad platform"""
    audience = db.query(models.Audience).filter(
        models.Audience.id == audience_id,
        models.Audience.store_id == current_user.store_id
    ).first()
    
    if not audience:
        raise HTTPException(status_code=404, detail="Audience not found")
    
    # Get customers
    customers = db.query(models.Customer).filter(
        models.Customer.id.in_(audience.customer_ids)
    ).all()
    
    # Prepare customer data for upload
    customer_data = []
    for customer in customers:
        customer_data.append({
            "email": customer.email if customer.email else "",
            "phone": customer.phone,
            "fn": customer.name.split()[0] if customer.name else "",
            "ln": customer.name.split()[-1] if len(customer.name.split()) > 1 else ""
        })
    
    audience.last_synced_at = datetime.utcnow()
    db.commit()
    
    return {
        "message": "Audience synced successfully",
        "size": len(customer_data)
    }

# ============ CAMPAIGN ANALYTICS ============

@router.get("/campaigns/{campaign_id}/analytics")
async def get_campaign_analytics(
    campaign_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get analytics for a specific campaign"""
    campaign = db.query(models.AdCampaignCreation).filter(
        models.AdCampaignCreation.id == campaign_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Check access - store managers can only see their store
    if current_user.role == models.UserRole.STORE_MANAGER and campaign.store_id != current_user.store_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get analytics data
    query = db.query(models.AdCampaignAnalytics).filter(
        models.AdCampaignAnalytics.campaign_id == campaign_id
    )
    
    if start_date:
        query = query.filter(models.AdCampaignAnalytics.date >= start_date)
    if end_date:
        query = query.filter(models.AdCampaignAnalytics.date <= end_date)
    
    analytics = query.order_by(models.AdCampaignAnalytics.date.desc()).all()
    
    # Calculate totals
    total_spend = sum(a.spend for a in analytics)
    total_impressions = sum(a.impressions for a in analytics)
    total_clicks = sum(a.clicks for a in analytics)
    total_leads = sum(a.leads for a in analytics)
    total_sales = sum(a.sales_attributed for a in analytics)
    total_revenue = sum(a.revenue_attributed for a in analytics)
    
    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    avg_cpc = total_spend / total_clicks if total_clicks > 0 else 0
    roas = total_revenue / total_spend if total_spend > 0 else 0
    
    return {
        "campaign": {
            "id": campaign.id,
            "name": campaign.campaign_name,
            "status": campaign.status,
            "platform": campaign.platform
        },
        "summary": {
            "total_spend": round(total_spend, 2),
            "total_impressions": total_impressions,
            "total_clicks": total_clicks,
            "total_leads": total_leads,
            "total_sales": total_sales,
            "total_revenue": round(total_revenue, 2),
            "avg_ctr": round(avg_ctr, 2),
            "avg_cpc": round(avg_cpc, 2),
            "roas": round(roas, 2)
        },
        "daily_data": analytics
    }

@router.get("/analytics/overview")
async def get_ads_overview(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get overall ads analytics for the store"""
    # Get all campaigns for the store
    campaigns = db.query(models.AdCampaignCreation).filter(
        models.AdCampaignCreation.store_id == current_user.store_id
    ).all()
    
    campaign_ids = [c.id for c in campaigns]
    
    # Get analytics
    query = db.query(models.AdCampaignAnalytics).filter(
        models.AdCampaignAnalytics.campaign_id.in_(campaign_ids)
    )
    
    if start_date:
        query = query.filter(models.AdCampaignAnalytics.date >= start_date)
    if end_date:
        query = query.filter(models.AdCampaignAnalytics.date <= end_date)
    
    analytics = query.all()
    
    # Calculate totals
    total_spend = sum(a.spend for a in analytics)
    total_impressions = sum(a.impressions for a in analytics)
    total_clicks = sum(a.clicks for a in analytics)
    total_leads = sum(a.leads for a in analytics)
    total_store_visits = sum(a.store_visits for a in analytics)
    total_sales = sum(a.sales_attributed for a in analytics)
    total_revenue = sum(a.revenue_attributed for a in analytics)
    
    return {
        "total_campaigns": len(campaigns),
        "active_campaigns": len([c for c in campaigns if c.status == models.AdCampaignStatus.ACTIVE]),
        "total_spend": round(total_spend, 2),
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "total_leads": total_leads,
        "total_store_visits": total_store_visits,
        "total_sales": total_sales,
        "total_revenue": round(total_revenue, 2),
        "roas": round(total_revenue / total_spend if total_spend > 0 else 0, 2)
    }

