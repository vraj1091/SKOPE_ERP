"""
Campaign Execution API
Endpoints for executing marketing campaigns and sending messages
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.db import models
from app.api.dependencies import get_current_user
from app.services.marketing_service import (
    execute_campaign,
    send_campaign_message,
    check_and_trigger_automated_campaigns
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# ==================== SCHEMAS ====================
class ExecuteCampaignRequest(BaseModel):
    customer_ids: Optional[List[int]] = None  # If None, send to all customers


class ExecuteCampaignResponse(BaseModel):
    success: bool
    campaign_id: int
    campaign_name: str
    total: int
    sent: int
    failed: int
    errors: List[dict] = []


class TestMessageRequest(BaseModel):
    campaign_id: int
    customer_id: int


class TestMessageResponse(BaseModel):
    success: bool
    message: str
    channel: str
    error: Optional[str] = None


# ==================== ENDPOINTS ====================

@router.post("/campaigns/{campaign_id}/execute", response_model=ExecuteCampaignResponse)
def execute_campaign_endpoint(
    campaign_id: int,
    request: ExecuteCampaignRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Execute a campaign - send messages to customers
    """
    try:
        # Verify campaign exists and belongs to user's store
        campaign = db.query(models.Campaign).filter(
            models.Campaign.id == campaign_id,
            models.Campaign.store_id == current_user.store_id
        ).first()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Execute campaign in background
        result = execute_campaign(campaign_id, db, request.customer_ids)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to execute campaign"))
        
        return ExecuteCampaignResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaigns/{campaign_id}/test", response_model=TestMessageResponse)
def test_campaign_message(
    campaign_id: int,
    request: TestMessageRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Send a test message to a single customer
    """
    try:
        # Verify campaign
        campaign = db.query(models.Campaign).filter(
            models.Campaign.id == campaign_id,
            models.Campaign.store_id == current_user.store_id
        ).first()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Verify customer
        customer = db.query(models.Customer).filter(
            models.Customer.id == request.customer_id,
            models.Customer.store_id == current_user.store_id
        ).first()
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Send test message
        result = send_campaign_message(campaign, customer, db)
        db.commit()
        
        return TestMessageResponse(
            success=result.get("success", False),
            message=f"Test message sent to {customer.name}",
            channel=result.get("channel", campaign.campaign_type.value),
            error=result.get("error")
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/campaigns/{campaign_id}/logs")
def get_campaign_logs(
    campaign_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get campaign execution logs
    """
    try:
        # Verify campaign
        campaign = db.query(models.Campaign).filter(
            models.Campaign.id == campaign_id,
            models.Campaign.store_id == current_user.store_id
        ).first()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Get logs
        logs = db.query(models.CampaignLog).filter(
            models.CampaignLog.campaign_id == campaign_id
        ).order_by(models.CampaignLog.sent_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign.name,
            "total_logs": db.query(models.CampaignLog).filter(
                models.CampaignLog.campaign_id == campaign_id
            ).count(),
            "logs": [
                {
                    "id": log.id,
                    "customer_id": log.customer_id,
                    "customer_name": log.customer.name if log.customer else "Unknown",
                    "status": log.status,
                    "channel": log.channel,
                    "message_sent": log.message_sent,
                    "error_message": log.error_message,
                    "sent_at": log.sent_at.isoformat() if log.sent_at else None
                }
                for log in logs
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/automation/trigger")
def trigger_automated_campaigns(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Manually trigger automated campaign checks
    (In production, this would be called by a cron job)
    """
    try:
        # Run in background
        background_tasks.add_task(check_and_trigger_automated_campaigns, db)
        
        return {
            "success": True,
            "message": "Automated campaign check triggered"
        }
    
    except Exception as e:
        logger.error(f"Error triggering automated campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/settings/credentials")
def get_marketing_credentials_status(
    current_user: models.User = Depends(get_current_user)
):
    """
    Check which marketing credentials are configured
    """
    import os
    
    return {
        "twilio": {
            "configured": bool(os.getenv("TWILIO_ACCOUNT_SID") and os.getenv("TWILIO_AUTH_TOKEN")),
            "phone_number": bool(os.getenv("TWILIO_PHONE_NUMBER")),
            "whatsapp_number": bool(os.getenv("TWILIO_WHATSAPP_NUMBER"))
        },
        "sendgrid": {
            "configured": bool(os.getenv("SENDGRID_API_KEY")),
            "from_email": os.getenv("SENDGRID_FROM_EMAIL", "noreply@skope-erp.com")
        }
    }
