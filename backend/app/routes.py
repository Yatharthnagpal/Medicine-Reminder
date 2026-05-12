from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .database import get_db
from .models import Reminder
from .schemas import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    DashboardStats,
    MessageResponse,
)

router = APIRouter(prefix="/api", tags=["reminders"])


# --- Dashboard ---

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics for reminders."""
    total = db.query(Reminder).count()
    pending = db.query(Reminder).filter(Reminder.status == "pending").count()
    sent = db.query(Reminder).filter(Reminder.status == "sent").count()
    failed = db.query(Reminder).filter(Reminder.status == "failed").count()
    return DashboardStats(total=total, pending=pending, sent=sent, failed=failed)


# --- Bulk Operations (must be before {reminder_id} routes) ---

@router.post("/reminders/update-messages", response_model=MessageResponse)
def bulk_update_messages(db: Session = Depends(get_db)):
    """Update the message for all reminders using the latest template."""
    reminders = db.query(Reminder).all()
    count = 0
    for reminder in reminders:
        new_message = (
            f"🙏 Namaskar {reminder.name} ji!\n\n"
            "Kamal Medicals, Behror ki taraf se aapko yaad dilana chahte hain:\n\n"
            "Samay par dawai lena bhule nahi! aapki zaroorat ki dawaiyon ke liye hamare paas aayein.\n"
            "📍 Kamal Medicals, near main chauraha NH8, Jodhpur Sweets Home ke samne, Behror, Rajasthan"
        )
        if reminder.message != new_message:
            reminder.message = new_message
            count += 1
    db.commit()
    return MessageResponse(message=f"Updated messages for {count} reminders", success=True)


@router.post("/reminders/reset-sent", response_model=MessageResponse)
def reset_sent_reminders(db: Session = Depends(get_db)):
    """Reset all 'sent' reminders: advance date by repeat interval and set back to pending."""
    sent_reminders = db.query(Reminder).filter(Reminder.status == "sent").all()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    count = 0
    for rem in sent_reminders:
        rt = rem.repeat_type or "15-days"
        if rt == "10-days":
            delta = timedelta(days=10)
        elif rt == "15-days":
            delta = timedelta(days=15)
        elif rt == "20-days":
            delta = timedelta(days=20)
        elif rt == "monthly":
            delta = timedelta(days=30)
        else:
            delta = timedelta(days=15)

        next_dt = rem.reminder_datetime + delta if rem.reminder_datetime else now + delta
        while next_dt <= now:
            next_dt += delta

        rem.reminder_datetime = next_dt
        rem.status = "pending"
        count += 1
    db.commit()
    return MessageResponse(message=f"Reset {count} sent reminders to pending", success=True)


# --- CRUD Operations ---

@router.get("/reminders", response_model=List[ReminderResponse])
def get_all_reminders(db: Session = Depends(get_db)):
    """Get all reminders ordered by reminder datetime."""
    reminders = (
        db.query(Reminder)
        .order_by(Reminder.name.asc())
        .all()
    )
    return reminders


@router.get("/reminders/{reminder_id}", response_model=ReminderResponse)
def get_reminder(reminder_id: int, db: Session = Depends(get_db)):
    """Get a single reminder by ID."""
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with id {reminder_id} not found"
        )
    return reminder


@router.post("/reminders", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(reminder_data: ReminderCreate, db: Session = Depends(get_db)):
    """Create a new reminder."""
    # Check for duplicate phone number
    existing = db.query(Reminder).filter(Reminder.phone == reminder_data.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A reminder with phone number {reminder_data.phone} already exists (Name: {existing.name})"
        )

    new_reminder = Reminder(
        name=reminder_data.name,
        phone=reminder_data.phone,
        message=reminder_data.message,
        medicine=reminder_data.medicine,
        reminder_datetime=reminder_data.reminder_datetime,
        repeat_type=reminder_data.repeat_type.value,
        status="pending",
    )
    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)
    return new_reminder


@router.put("/reminders/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing reminder."""
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with id {reminder_id} not found"
        )

    update_data = reminder_data.model_dump(exclude_unset=True)

    # Check for duplicate phone number on update
    new_phone = update_data.get("phone")
    if new_phone and new_phone != reminder.phone:
        existing = db.query(Reminder).filter(Reminder.phone == new_phone).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A reminder with phone number {new_phone} already exists (Name: {existing.name})"
            )

    # Check if status is being changed to "sent" (manual mark)
    new_status = update_data.get("status")
    if new_status and (new_status == "sent" or (hasattr(new_status, "value") and new_status.value == "sent")):
        # Advance reminder_datetime to next schedule, keep as "sent"
        # The scheduler will reset to "pending" when the next date arrives
        rt = reminder.repeat_type or "15-days"
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        if rt == "10-days":
            delta = timedelta(days=10)
        elif rt == "15-days":
            delta = timedelta(days=15)
        elif rt == "20-days":
            delta = timedelta(days=20)
        elif rt == "monthly":
            delta = timedelta(days=30)
        else:
            delta = timedelta(days=15)  # fallback

        next_dt = reminder.reminder_datetime + delta if reminder.reminder_datetime else now + delta
        while next_dt <= now:
            next_dt += delta

        reminder.reminder_datetime = next_dt
        reminder.status = "sent"
        reminder.last_sent_at = now
        db.commit()
        db.refresh(reminder)
        return reminder

    # Normal update (edit form, etc.)
    for field, value in update_data.items():
        if hasattr(value, "value"):
            value = value.value  # Convert enum to string
        setattr(reminder, field, value)

    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/reminders/{reminder_id}", response_model=MessageResponse)
def delete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    """Delete a reminder by ID."""
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with id {reminder_id} not found"
        )

    db.delete(reminder)
    db.commit()
    return MessageResponse(message=f"Reminder '{reminder.name}' deleted successfully", success=True)
