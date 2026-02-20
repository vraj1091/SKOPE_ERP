from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.db.models import CampaignType, CampaignStatus, CampaignTrigger

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    campaign_type: CampaignType
    trigger_type: CampaignTrigger = CampaignTrigger.MANUAL
    message_template: str
    subject: Optional[str] = None
    target_customers: Optional[Dict[str, Any]] = None
    geo_location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    send_time: Optional[str] = None
    days_before_trigger: Optional[int] = None
    discount_code: Optional[str] = None
    discount_percentage: Optional[float] = None

class CampaignCreate(CampaignBase):
    store_id: int

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CampaignStatus] = None
    message_template: Optional[str] = None
    subject: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignResponse(CampaignBase):
    id: int
    status: CampaignStatus
    store_id: int
    total_sent: int
    total_opened: int
    total_clicked: int
    total_converted: int
    revenue: Optional[float] = 0.0
    created_at: datetime
    
    class Config:
        from_attributes = True

class CampaignStats(BaseModel):
    campaign_id: int
    campaign_name: str
    total_sent: int
    total_opened: int
    total_clicked: int
    total_converted: int
    open_rate: float
    click_rate: float
    conversion_rate: float

