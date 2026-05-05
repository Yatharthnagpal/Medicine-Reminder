"""Background jobs: send due reminders to admin via WhatsApp."""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from apscheduler.schedulers.background import BackgroundScheduler

from .database import SessionLocal
from .models import Reminder
from . import whatsapp

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def _utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _next_after_send(reminder: Reminder) -> Tuple[str, Optional[datetime]]:
    """
    After a successful notify, return (new_status, new_reminder_datetime).
    For recurring reminders, new_reminder_datetime is the next scheduled time; else None.
    """
    rt = reminder.repeat_type or "15-days"

    now = _utc_now_naive()
    current = reminder.reminder_datetime
    if current is None:
        return "sent", None

    if rt == "10-days":
        delta = timedelta(days=10)
    elif rt == "15-days":
        delta = timedelta(days=15)
    elif rt == "20-days":
        delta = timedelta(days=20)
    elif rt == "monthly":
        delta = timedelta(days=30)
    else:
        logger.warning("Unknown repeat_type %r; marking sent", rt)
        return "sent", None

    next_dt = current + delta
    while next_dt <= now:
        next_dt += delta
    return "pending", next_dt


def process_due_reminders() -> None:
    db = SessionLocal()
    try:
        now = _utc_now_naive()
        due = (
            db.query(Reminder)
            .filter(Reminder.status == "pending", Reminder.reminder_datetime <= now)
            .order_by(Reminder.reminder_datetime.asc())
            .all()
        )
        for rem in due:
            when_str = rem.reminder_datetime.isoformat() if rem.reminder_datetime else ""
            ok, err = whatsapp.send_admin_reminder_alert(
                rem.name,
                rem.phone,
                rem.message,
                when_str,
                rem.repeat_type,
                medicine=rem.medicine,
            )
            if not ok:
                rem.status = "failed"
                db.commit()
                logger.error("Reminder %s WhatsApp to admin failed: %s", rem.id, err)
                continue

            rem.last_sent_at = now
            new_status, next_dt = _next_after_send(rem)
            rem.status = new_status
            if next_dt is not None:
                rem.reminder_datetime = next_dt
            db.commit()
            logger.info("Reminder %s notified admin -> status=%s", rem.id, new_status)
    except Exception:
        logger.exception("process_due_reminders failed")
        db.rollback()
    finally:
        db.close()


def start_scheduler() -> None:
    if scheduler.running:
        return
    scheduler.add_job(
        process_due_reminders,
        "interval",
        seconds=30,
        id="due_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Reminder scheduler started (30s interval)")


def shutdown_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Reminder scheduler stopped")
