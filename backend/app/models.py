from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from .database import Base


class Reminder(Base):
    """SQLAlchemy model for reminders."""

    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    medicine = Column(Text, nullable=True)
    reminder_datetime = Column(DateTime, nullable=False)
    repeat_type = Column(String(20), nullable=False, default="one-time")
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_sent_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Reminder(id={self.id}, name='{self.name}', status='{self.status}')>"
