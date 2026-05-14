import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database file stored in the backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'reminders.db')}")

# Fix postgres:// to postgresql:// for SQLAlchemy compatibility
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Only use check_same_thread for sqlite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_sqlite_reminders_schema() -> None:
    """Add columns missing from older SQLite DBs (create_all does not ALTER)."""
    if not str(engine.url).startswith("sqlite"):
        return
    with engine.connect() as conn:
        rows = conn.execute(text("PRAGMA table_info(reminders)")).fetchall()
        cols = {r[1] for r in rows}
        if "medicine" not in cols:
            conn.execute(text("ALTER TABLE reminders ADD COLUMN medicine TEXT"))
            conn.commit()

        # Ensure unique index on phone column (for existing DBs)
        indexes = conn.execute(text("PRAGMA index_list(reminders)")).fetchall()
        idx_names = {r[1] for r in indexes}
        if "ix_reminders_phone_unique" not in idx_names:
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_reminders_phone_unique ON reminders(phone)"))
            conn.commit()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
