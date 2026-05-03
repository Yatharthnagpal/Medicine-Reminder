import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import engine, Base, ensure_sqlite_reminders_schema
from .routes import router
from .scheduler import shutdown_scheduler, start_scheduler

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    # Startup
    logger.info("🚀 Starting Reminder App...")
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_reminders_schema()
    logger.info("✅ Database tables created.")
    start_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()
    logger.info("👋 App shutdown complete.")


app = FastAPI(
    title="WhatsApp Reminder API",
    description="A simple API to manage and send WhatsApp reminders",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "WhatsApp Reminder API is running 🟢"}
