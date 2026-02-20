from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    STORE_MANAGER = "store_manager"
    SALES_STAFF = "sales_staff"
    MARKETING = "marketing"
    ACCOUNTS = "accounts"

class PaymentMode(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    QR_CODE = "qr_code"

class CampaignType(str, enum.Enum):
    WHATSAPP = "whatsapp"
    SMS = "sms"
    EMAIL = "email"
    NOTIFICATION = "notification"

class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

class CampaignTrigger(str, enum.Enum):
    MANUAL = "manual"
    BIRTHDAY = "birthday"
    FESTIVAL = "festival"
    WARRANTY_EXPIRY = "warranty_expiry"
    CART_ABANDONED = "cart_abandoned"
    PURCHASE_ANNIVERSARY = "purchase_anniversary"
    NO_PURCHASE_30_DAYS = "no_purchase_30_days"
    GEO_TARGETED = "geo_targeted"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.SALES_STAFF)
    is_active = Column(Boolean, default=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")

class Store(Base):
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(Text)
    phone = Column(String)
    email = Column(String)
    gst_number = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    users = relationship("User", back_populates="store")
    products = relationship("Product", back_populates="store")
    customers = relationship("Customer", back_populates="store")
    sales = relationship("Sale", back_populates="store")
    expenses = relationship("Expense", back_populates="store")
    campaigns = relationship("Campaign", back_populates="store")
    marketing_integrations = relationship("MarketingIntegration", back_populates="store")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    brand = Column(String)
    unit_price = Column(Float, nullable=False)
    cost_price = Column(Float)
    gst_rate = Column(Float, default=18.0)
    image_url = Column(String)
    warranty_months = Column(Integer, default=0)
    current_stock = Column(Integer, default=0)
    minimum_stock = Column(Integer, default=10)
    store_id = Column(Integer, ForeignKey("stores.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store", back_populates="products")
    batches = relationship("Batch", back_populates="product")
    sale_items = relationship("SaleItem", back_populates="product")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    remaining_quantity = Column(Integer, nullable=False)
    serial_numbers = Column(Text)
    manufacturing_date = Column(DateTime(timezone=True))
    expiry_date = Column(DateTime(timezone=True))
    received_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product", back_populates="batches")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String, nullable=False, index=True)
    address = Column(Text)
    gst_number = Column(String)
    date_of_birth = Column(DateTime(timezone=True))
    store_id = Column(Integer, ForeignKey("stores.id"))
    total_purchases = Column(Float, default=0.0)
    loyalty_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store", back_populates="customers")
    sales = relationship("Sale", back_populates="customer")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    subtotal = Column(Float, nullable=False)
    gst_amount = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    payment_mode = Column(SQLEnum(PaymentMode), nullable=False)
    payment_status = Column(String, default="completed")
    created_by = Column(Integer, ForeignKey("users.id"))
    sale_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    store = relationship("Store", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    sale_items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    
    # Alias for API response
    @property
    def items(self):
        return self.sale_items

class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    gst_rate = Column(Float, nullable=False)
    gst_amount = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    serial_number = Column(String)
    warranty_expires_at = Column(DateTime(timezone=True))
    
    sale = relationship("Sale", back_populates="sale_items")
    product = relationship("Product", back_populates="sale_items")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(SQLEnum(PaymentMode), nullable=False)
    vendor_name = Column(String)
    receipt_number = Column(String)
    voucher_file = Column(String)  # Store file path/URL for bill/voucher
    created_by = Column(Integer, ForeignKey("users.id"))
    expense_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    store = relationship("Store", back_populates="expenses")

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    campaign_type = Column(SQLEnum(CampaignType), nullable=False)
    trigger_type = Column(SQLEnum(CampaignTrigger), default=CampaignTrigger.MANUAL)
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.DRAFT)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    
    # Message content
    message_template = Column(Text, nullable=False)
    subject = Column(String)  # For email campaigns
    
    # Targeting
    target_customers = Column(JSON)  # Filter criteria
    geo_location = Column(String)  # For geo-targeted campaigns
    
    # Scheduling
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    send_time = Column(String)  # Time of day to send (HH:MM format)
    
    # Automation rules
    days_before_trigger = Column(Integer)  # For warranty expiry, birthday etc
    discount_code = Column(String)
    discount_percentage = Column(Float)
    
    # Stats
    total_sent = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_converted = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store", back_populates="campaigns")
    campaign_logs = relationship("CampaignLog", back_populates="campaign")

class CampaignLog(Base):
    __tablename__ = "campaign_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    opened_at = Column(DateTime(timezone=True))
    clicked_at = Column(DateTime(timezone=True))
    converted_at = Column(DateTime(timezone=True))
    status = Column(String, default="sent")  # sent, delivered, failed, opened, clicked, converted
    
    campaign = relationship("Campaign", back_populates="campaign_logs")

class MarketingIntegration(Base):
    __tablename__ = "marketing_integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    platform = Column(String, nullable=False)  # google_ads, meta_ads, facebook, instagram
    account_id = Column(String)
    account_name = Column(String)
    access_token = Column(Text)  # Encrypted in production
    refresh_token = Column(Text)  # Encrypted in production
    token_expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime(timezone=True))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store", back_populates="marketing_integrations")

class MarketingCampaignSync(Base):
    __tablename__ = "marketing_campaign_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("marketing_integrations.id"), nullable=False)
    external_campaign_id = Column(String, nullable=False)
    campaign_name = Column(String, nullable=False)
    platform = Column(String, nullable=False)  # google_ads, meta_ads
    status = Column(String)  # active, paused, ended
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    spend = Column(Float, default=0.0)
    ctr = Column(Float, default=0.0)  # Click-through rate
    cpc = Column(Float, default=0.0)  # Cost per click
    roas = Column(Float, default=0.0)  # Return on ad spend
    last_synced_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    integration = relationship("MarketingIntegration")

# ============ NEW MODELS FOR META & GOOGLE ADS INTEGRATION ============

class AdPlatform(str, enum.Enum):
    META = "meta"
    GOOGLE = "google"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    WHATSAPP = "whatsapp"

class AdCampaignTemplate(str, enum.Enum):
    # Meta Templates
    STORE_VISIT = "store_visit"
    LEAD_FORM = "lead_form"
    WHATSAPP_CLICK = "whatsapp_click"
    OFFER_FESTIVAL = "offer_festival"
    PRODUCT_CATALOG = "product_catalog"
    # Google Templates
    LOCAL_SEARCH_ADS = "local_search_ads"
    PERFORMANCE_MAX = "performance_max"
    DISPLAY_REMARKETING = "display_remarketing"
    YOUTUBE_LOCAL_AWARENESS = "youtube_local_awareness"

class AdCampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    REJECTED = "rejected"

class AdAccountConnection(Base):
    """Stores Meta/Google Ad Account connections for each store"""
    __tablename__ = "ad_account_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    platform = Column(SQLEnum(AdPlatform), nullable=False)
    
    # Meta specific fields
    meta_ad_account_id = Column(String)
    meta_pixel_id = Column(String)
    meta_page_id = Column(String)
    meta_business_id = Column(String)
    
    # Google specific fields
    google_customer_id = Column(String)
    google_conversion_actions = Column(JSON)
    google_ga4_property = Column(String)
    
    # OAuth tokens
    access_token = Column(Text)
    refresh_token = Column(Text)
    token_expires_at = Column(DateTime(timezone=True))
    token_type = Column(String, default="Bearer")
    
    # Connection status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_token_refresh = Column(DateTime(timezone=True))
    last_sync_at = Column(DateTime(timezone=True))
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store")

class CreativeAsset(Base):
    """Asset library for images, videos, logos for ads"""
    __tablename__ = "creative_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)  # image, video, logo
    file_path = Column(String, nullable=False)
    file_url = Column(String)
    file_size = Column(Integer)
    dimensions = Column(String)  # e.g., "1080x1080"
    
    # Platform-specific IDs after upload
    meta_creative_id = Column(String)
    google_asset_id = Column(String)
    
    is_approved = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store")

class AdCampaignCreation(Base):
    """Stores ad campaigns created through ERP"""
    __tablename__ = "ad_campaign_creations"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    ad_account_id = Column(Integer, ForeignKey("ad_account_connections.id"), nullable=False)
    
    campaign_name = Column(String, nullable=False)
    campaign_template = Column(SQLEnum(AdCampaignTemplate), nullable=False)
    platform = Column(SQLEnum(AdPlatform), nullable=False)
    status = Column(SQLEnum(AdCampaignStatus), default=AdCampaignStatus.DRAFT)
    
    # Campaign details
    objective = Column(String)
    budget_daily = Column(Float)
    budget_total = Column(Float)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Creative details
    headline = Column(String)
    description = Column(Text)
    call_to_action = Column(String)
    asset_ids = Column(JSON)  # List of creative asset IDs
    
    # Targeting
    target_audience = Column(JSON)
    location_radius = Column(Float)  # in km
    age_min = Column(Integer)
    age_max = Column(Integer)
    gender = Column(String)
    interests = Column(JSON)
    
    # Dynamic creative fields
    store_name_dynamic = Column(Boolean, default=True)
    location_dynamic = Column(Boolean, default=True)
    offer_text = Column(String)
    
    # External platform IDs
    external_campaign_id = Column(String)
    external_ad_set_id = Column(String)
    external_ad_id = Column(String)
    
    # Approval workflow
    created_by = Column(Integer, ForeignKey("users.id"))
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store")
    ad_account = relationship("AdAccountConnection")

class Audience(Base):
    """Custom audiences for ad targeting"""
    __tablename__ = "audiences"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    ad_account_id = Column(Integer, ForeignKey("ad_account_connections.id"), nullable=False)
    
    name = Column(String, nullable=False)
    audience_type = Column(String, nullable=False)  # custom, lookalike, retargeting
    platform = Column(SQLEnum(AdPlatform), nullable=False)
    
    # Source criteria from ERP
    source_criteria = Column(JSON)  # e.g., {"segment": "past_buyers", "days": 30}
    customer_ids = Column(JSON)  # List of customer IDs from ERP
    
    # Platform-specific IDs
    external_audience_id = Column(String)
    
    # Audience stats
    size = Column(Integer, default=0)
    last_synced_at = Column(DateTime(timezone=True))
    auto_sync = Column(Boolean, default=True)
    
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    store = relationship("Store")
    ad_account = relationship("AdAccountConnection")

class ConversionTracking(Base):
    """Track conversions from ads"""
    __tablename__ = "conversion_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("ad_campaign_creations.id"))
    
    conversion_type = Column(String, nullable=False)  # store_visit, lead, sale, call
    customer_id = Column(Integer, ForeignKey("customers.id"))
    sale_id = Column(Integer, ForeignKey("sales.id"))
    
    platform = Column(SQLEnum(AdPlatform), nullable=False)
    external_conversion_id = Column(String)
    
    conversion_value = Column(Float, default=0.0)
    conversion_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Attribution
    click_id = Column(String)  # fbclid, gclid
    utm_source = Column(String)
    utm_medium = Column(String)
    utm_campaign = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    store = relationship("Store")
    campaign = relationship("AdCampaignCreation")
    customer = relationship("Customer")
    sale = relationship("Sale")

class AdCampaignAnalytics(Base):
    """Daily analytics for ad campaigns"""
    __tablename__ = "ad_campaign_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("ad_campaign_creations.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Float, default=0.0)
    reach = Column(Integer, default=0)
    
    # Conversions
    leads = Column(Integer, default=0)
    store_visits = Column(Integer, default=0)
    sales_attributed = Column(Integer, default=0)
    revenue_attributed = Column(Float, default=0.0)
    
    # Calculated metrics
    ctr = Column(Float, default=0.0)  # Click-through rate
    cpc = Column(Float, default=0.0)  # Cost per click
    cpl = Column(Float, default=0.0)  # Cost per lead
    roas = Column(Float, default=0.0)  # Return on ad spend
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    campaign = relationship("AdCampaignCreation")

# ============ STAFF PERFORMANCE MODELS ============

class StaffAttendance(Base):
    """Track staff attendance"""
    __tablename__ = "staff_attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    
    date = Column(DateTime(timezone=True), nullable=False)
    check_in = Column(DateTime(timezone=True))
    check_out = Column(DateTime(timezone=True))
    
    status = Column(String, nullable=False)  # present, absent, half_day, leave
    hours_worked = Column(Float, default=0.0)
    
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    store = relationship("Store")

class StaffTarget(Base):
    """Monthly sales targets for staff"""
    __tablename__ = "staff_targets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    
    month = Column(String, nullable=False)  # Format: YYYY-MM
    target_amount = Column(Float, nullable=False)
    achieved_amount = Column(Float, default=0.0)
    
    incentive_percentage = Column(Float, default=0.0)
    incentive_earned = Column(Float, default=0.0)
    incentive_paid = Column(Float, default=0.0)
    incentive_pending = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")
    store = relationship("Store")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String)
    entity_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="audit_logs")

class SystemSetting(Base):
    """Global system settings and configurations"""
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String)
    is_encrypted = Column(Boolean, default=False)
    group = Column(String, default="general") # e.g., 'marketing', 'security', 'billing'
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
