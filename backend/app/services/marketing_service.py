"""
Marketing Automation Service
Handles real WhatsApp, SMS, and Email sending for campaigns
"""
import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db import models
import logging

logger = logging.getLogger(__name__)

# ==================== CONFIGURATION HELPER ====================
def get_system_setting(db: Session, key: str, default: str = "") -> str:
    """Get system setting from DB, fallback to env var, then default"""
    if not db:
        return os.getenv(key, default)
        
    setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if setting:
        return setting.value
    
    return os.getenv(key, default)

# ==================== TWILIO SMS/WhatsApp ====================
def send_sms(to_phone: str, message: str, db: Session = None) -> Dict:
    """
    Send SMS using Twilio
    """
    try:
        account_sid = get_system_setting(db, "TWILIO_ACCOUNT_SID")
        auth_token = get_system_setting(db, "TWILIO_AUTH_TOKEN")
        from_number = get_system_setting(db, "TWILIO_PHONE_NUMBER")
        
        if not account_sid or not auth_token:
            logger.warning("Twilio credentials not configured. SMS not sent.")
            return {
                "success": False,
                "error": "Twilio not configured",
                "demo_mode": True,
                "message": "Demo: SMS would be sent to " + to_phone
            }
        
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        
        # Ensure phone number has country code
        if not to_phone.startswith('+'):
            to_phone = '+91' + to_phone.replace('+91', '').replace(' ', '').replace('-', '')
        
        message_obj = client.messages.create(
            body=message,
            from_=from_number,
            to=to_phone
        )
        
        logger.info(f"SMS sent successfully to {to_phone}. SID: {message_obj.sid}")
        return {
            "success": True,
            "sid": message_obj.sid,
            "status": message_obj.status,
            "to": to_phone
        }
    
    except Exception as e:
        logger.error(f"Failed to send SMS to {to_phone}: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "to": to_phone
        }


def send_whatsapp(to_phone: str, message: str, db: Session = None) -> Dict:
    """
    Send WhatsApp message using Twilio
    """
    try:
        account_sid = get_system_setting(db, "TWILIO_ACCOUNT_SID")
        auth_token = get_system_setting(db, "TWILIO_AUTH_TOKEN")
        whatsapp_number = get_system_setting(db, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
        
        if not account_sid or not auth_token:
            logger.warning("Twilio credentials not configured. WhatsApp not sent.")
            return {
                "success": False,
                "error": "Twilio not configured",
                "demo_mode": True,
                "message": "Demo: WhatsApp would be sent to " + to_phone
            }
        
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        
        # Ensure phone number has country code and whatsapp: prefix
        if not to_phone.startswith('+'):
            to_phone = '+91' + to_phone.replace('+91', '').replace(' ', '').replace('-', '')
        
        if not to_phone.startswith('whatsapp:'):
            to_phone = 'whatsapp:' + to_phone
        
        message_obj = client.messages.create(
            body=message,
            from_=whatsapp_number,
            to=to_phone
        )
        
        logger.info(f"WhatsApp sent successfully to {to_phone}. SID: {message_obj.sid}")
        return {
            "success": True,
            "sid": message_obj.sid,
            "status": message_obj.status,
            "to": to_phone
        }
    
    except Exception as e:
        logger.error(f"Failed to send WhatsApp to {to_phone}: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "to": to_phone
        }


# ==================== SENDGRID EMAIL ====================
def send_email(to_email: str, subject: str, html_content: str, text_content: str = None, db: Session = None) -> Dict:
    """
    Send Email using SendGrid
    """
    try:
        api_key = get_system_setting(db, "SENDGRID_API_KEY")
        from_email = get_system_setting(db, "SENDGRID_FROM_EMAIL", "noreply@skope-erp.com")
        from_name = get_system_setting(db, "SENDGRID_FROM_NAME", "SKOPE ERP")
        
        if not api_key:
            logger.warning("SendGrid API key not configured. Email not sent.")
            return {
                "success": False,
                "error": "SendGrid not configured",
                "demo_mode": True,
                "message": "Demo: Email would be sent to " + to_email
            }
        
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        message = Mail(
            from_email=Email(from_email, from_name),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content)
        )
        
        if text_content:
            message.add_content(Content("text/plain", text_content))
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        logger.info(f"Email sent successfully to {to_email}. Status: {response.status_code}")
        return {
            "success": True,
            "status_code": response.status_code,
            "to": to_email
        }
    
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "to": to_email
        }


# ==================== MESSAGE TEMPLATE PROCESSOR ====================
def process_template(template: str, customer: models.Customer, campaign: models.Campaign = None, **kwargs) -> str:
    """
    Process message template with customer data
    """
    replacements = {
        '{customer_name}': customer.name or 'Valued Customer',
        '{name}': customer.name or 'Valued Customer',
        '{email}': customer.email or '',
        '{phone}': customer.phone or '',
        '{loyalty_points}': str(customer.loyalty_points or 0),
    }
    
    if campaign:
        replacements['{campaign_name}'] = campaign.name or ''
        replacements['{discount_code}'] = campaign.discount_code or ''
        # Use getattr safely and handle None
        discount_percentage = getattr(campaign, 'discount_percentage', 0)
        replacements['{discount}'] = str(discount_percentage) + '%'
        
        if campaign.end_date:
            replacements['{end_date}'] = campaign.end_date.strftime('%d %B %Y')
        if campaign.start_date:
            replacements['{start_date}'] = campaign.start_date.strftime('%d %B %Y')
    
    # Add any additional kwargs
    for key, value in kwargs.items():
        replacements[f'{{{key}}}'] = str(value)
    
    message = template
    for placeholder, value in replacements.items():
        message = message.replace(placeholder, value)
    
    return message


# ==================== CAMPAIGN EXECUTION ====================
def send_campaign_message(
    campaign: models.Campaign,
    customer: models.Customer,
    db: Session
) -> Dict:
    """
    Send a single campaign message to a customer
    """
    try:
        # Process the message template
        message = process_template(
            campaign.message_template,
            customer,
            campaign
        )
        
        result = {"success": False, "channel": campaign.campaign_type.value}
        
        # Send based on campaign type
        if campaign.campaign_type == models.CampaignType.SMS:
            if customer.phone:
                result = send_sms(customer.phone, message, db)
                result["channel"] = "SMS"
            else:
                result = {"success": False, "error": "No phone number", "channel": "SMS"}
        
        elif campaign.campaign_type == models.CampaignType.WHATSAPP:
            if customer.phone:
                result = send_whatsapp(customer.phone, message, db)
                result["channel"] = "WhatsApp"
            else:
                result = {"success": False, "error": "No phone number", "channel": "WhatsApp"}
        
        elif campaign.campaign_type == models.CampaignType.EMAIL:
            if customer.email:
                # Create HTML email from message
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">{campaign.name}</h2>
                        <div style="white-space: pre-wrap; line-height: 1.6;">
                            {message.replace(chr(10), '<br>')}
                        </div>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 12px;">
                            You received this email because you are a valued customer of SKOPE ERP.
                        </p>
                    </div>
                </body>
                </html>
                """
                result = send_email(
                    customer.email,
                    campaign.name,
                    html_content,
                    message,
                    db
                )
                result["channel"] = "Email"
            else:
                result = {"success": False, "error": "No email address", "channel": "Email"}
        
        elif campaign.campaign_type == models.CampaignType.NOTIFICATION:
            # In-app notification (just log for now)
            logger.info(f"In-app notification for customer {customer.id}: {message}")
            result = {
                "success": True,
                "channel": "Notification",
                "message": "In-app notification logged"
            }
        
        # Log the campaign message
        campaign_log = models.CampaignLog(
            campaign_id=campaign.id,
            customer_id=customer.id,
            message_sent=message,
            status="sent" if result.get("success") else "failed",
            channel=result.get("channel", campaign.campaign_type.value),
            error_message=result.get("error") if not result.get("success") else None,
            sent_at=datetime.now()
        )
        db.add(campaign_log)
        
        return result
    
    except Exception as e:
        logger.error(f"Error sending campaign message: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "channel": campaign.campaign_type.value
        }


def execute_campaign(campaign_id: int, db: Session, customer_ids: List[int] = None) -> Dict:
    """
    Execute a campaign - send messages to all eligible customers
    """
    try:
        campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
        if not campaign:
            return {"success": False, "error": "Campaign not found"}
        
        # Get customers to send to
        if customer_ids:
            customers = db.query(models.Customer).filter(
                models.Customer.id.in_(customer_ids),
                models.Customer.store_id == campaign.store_id
            ).all()
        else:
            # Get all active customers for the store
            customers = db.query(models.Customer).filter(
                models.Customer.store_id == campaign.store_id
            ).limit(1000).all()  # Limit to prevent overwhelming
        
        if not customers:
            return {"success": False, "error": "No customers found"}
        
        # Send messages
        results = {
            "total": len(customers),
            "sent": 0,
            "failed": 0,
            "errors": []
        }
        
        for customer in customers:
            result = send_campaign_message(campaign, customer, db)
            
            if result.get("success"):
                results["sent"] += 1
                campaign.total_sent = (campaign.total_sent or 0) + 1
            else:
                results["failed"] += 1
                results["errors"].append({
                    "customer_id": customer.id,
                    "customer_name": customer.name,
                    "error": result.get("error", "Unknown error")
                })
        
        # Update campaign stats
        campaign.last_run_at = datetime.now()
        if campaign.status == models.CampaignStatus.SCHEDULED:
            campaign.status = models.CampaignStatus.ACTIVE
        
        db.commit()
        
        logger.info(f"Campaign {campaign_id} executed: {results['sent']} sent, {results['failed']} failed")
        return {
            "success": True,
            "campaign_id": campaign_id,
            "campaign_name": campaign.name,
            **results
        }
    
    except Exception as e:
        logger.error(f"Error executing campaign {campaign_id}: {str(e)}")
        db.rollback()
        return {
            "success": False,
            "error": str(e)
        }


# ==================== AUTOMATED TRIGGERS ====================
def check_and_trigger_automated_campaigns(db: Session):
    """
    Check for automated campaign triggers and execute them
    This should be run periodically (e.g., every hour via cron job)
    """
    try:
        now = datetime.now()
        
        # Get all active automated campaigns
        campaigns = db.query(models.Campaign).filter(
            models.Campaign.status == models.CampaignStatus.ACTIVE,
            models.Campaign.trigger_type != models.CampaignTrigger.MANUAL
        ).all()
        
        for campaign in campaigns:
            # Birthday campaigns
            if campaign.trigger_type == models.CampaignTrigger.BIRTHDAY:
                # Find customers with birthdays today
                # Note: This assumes you have a birthday field in Customer model
                # If not, skip this trigger
                pass
            
            # Warranty expiry campaigns
            elif campaign.trigger_type == models.CampaignTrigger.WARRANTY_EXPIRY:
                days_before = campaign.days_before_trigger or 30
                # Find products with warranties expiring soon
                # This would require tracking purchase dates and warranty periods
                pass
            
            # No purchase in 30 days
            elif campaign.trigger_type == models.CampaignTrigger.NO_PURCHASE_30_DAYS:
                cutoff_date = now - timedelta(days=30)
                # Find customers who haven't purchased in 30 days
                customers = db.query(models.Customer).filter(
                    models.Customer.store_id == campaign.store_id,
                    models.Customer.last_purchase_date < cutoff_date
                ).limit(100).all()
                
                if customers:
                    customer_ids = [c.id for c in customers]
                    execute_campaign(campaign.id, db, customer_ids)
            
            # Festival campaigns (check if today is within campaign date range)
            elif campaign.trigger_type == models.CampaignTrigger.FESTIVAL:
                if campaign.start_date and campaign.end_date:
                    if campaign.start_date <= now <= campaign.end_date:
                        # Only send once per day
                        # Check last run date if available (or add column)
                        execute_campaign(campaign.id, db)
        
        logger.info("Automated campaign check completed")
        return {"success": True, "message": "Automated campaigns checked"}
    
    except Exception as e:
        logger.error(f"Error checking automated campaigns: {str(e)}")
        return {"success": False, "error": str(e)}
