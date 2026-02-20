from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.api.dependencies import get_current_user, get_super_admin
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

router = APIRouter()

# Schema
class SystemSettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    group: Optional[str] = "general"
    is_encrypted: bool = False

class SystemSettingRead(SystemSettingBase):
    id: int
    updated_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SystemSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

@router.get("/", response_model=List[SystemSettingRead])
def get_settings(
    group: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get system settings, optionally filtered by group"""
    query = db.query(models.SystemSetting)
    if group:
        query = query.filter(models.SystemSetting.group == group)
    return query.all()

@router.post("/", response_model=SystemSettingRead)
def create_setting(
    setting: SystemSettingBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_super_admin)
):
    """Create a new system setting (Super Admin only)"""
    existing = db.query(models.SystemSetting).filter(models.SystemSetting.key == setting.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setting with this key already exists")
    
    db_setting = models.SystemSetting(**setting.model_dump())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

@router.put("/{key}", response_model=SystemSettingRead)
def update_setting(
    key: str,
    setting: SystemSettingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_super_admin)
):
    """Update an existing system setting (Super Admin only)"""
    # Verify key exists
    db_setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if not db_setting:
        # If it doesn't exist, create it (convenience for UI)
        db_setting = models.SystemSetting(key=key, value=setting.value, description=setting.description)
        db.add(db_setting)
        db.commit()
        db.refresh(db_setting)
        return db_setting
    
    db_setting.value = setting.value
    if setting.description:
        db_setting.description = setting.description
        
    db.commit()
    db.refresh(db_setting)
    return db_setting

@router.get("/public", response_model=List[SystemSettingRead])
def get_public_settings(db: Session = Depends(get_db)):
    """Get public settings (non-encrypted)"""
    return db.query(models.SystemSetting).filter(models.SystemSetting.is_encrypted == False).all()
