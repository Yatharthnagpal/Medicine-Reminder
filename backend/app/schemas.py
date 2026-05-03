from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class RepeatType(str, Enum):
    ONE_TIME = "one-time"
    DAILY = "daily"
    TEN_DAYS = "10-days"
    MONTHLY = "monthly"


class ReminderStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


# --- Request Schemas ---

class ReminderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Person's name")
    phone: str = Field(..., min_length=10, max_length=20, description="Phone number with country code")
    message: str = Field(..., min_length=1, description="Reminder message")
    medicine: Optional[str] = Field(None, description="Medicine name (admin only)")
    reminder_datetime: datetime = Field(..., description="When to send the reminder")
    repeat_type: RepeatType = Field(default=RepeatType.ONE_TIME, description="Repeat frequency")


class ReminderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    message: Optional[str] = Field(None, min_length=1)
    medicine: Optional[str] = None
    reminder_datetime: Optional[datetime] = None
    repeat_type: Optional[RepeatType] = None
    status: Optional[ReminderStatus] = None


# --- Response Schemas ---

class ReminderResponse(BaseModel):
    id: int
    name: str
    phone: str
    message: str
    medicine: Optional[str] = None
    reminder_datetime: datetime
    repeat_type: str
    status: str
    created_at: datetime
    last_sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total: int
    pending: int
    sent: int
    failed: int


class MessageResponse(BaseModel):
    message: str
    success: bool
