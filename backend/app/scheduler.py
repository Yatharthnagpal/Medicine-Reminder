"""Background jobs: manage reminder status lifecycle."""
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler

from .database import SessionLocal
from .models import Reminder

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def _utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def process_due_reminders() -> None:
    """Reset 'sent' reminders back to 'pending' when their next schedule date arrives."""
    db = SessionLocal()
    try:
        now = _utc_now_naive()

        # Reset "sent" reminders whose next schedule time has arrived back to "pending"
        sent_due = (
            db.query(Reminder)
            .filter(Reminder.status == "sent", Reminder.reminder_datetime <= now)
            .all()
        )
        for rem in sent_due:
            rem.status = "pending"
            db.commit()
            logger.info("Reminder %s reset from sent -> pending (schedule reached)", rem.id)

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
