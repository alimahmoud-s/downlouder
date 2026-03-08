from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

# The broker and backend fall back to typical local defaults if not defined in .env
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "media_downloader",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["src.tasks.download_tasks"]
)

# Optional configuration, e.g., to serialize with JSON
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
