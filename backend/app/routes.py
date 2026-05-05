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
