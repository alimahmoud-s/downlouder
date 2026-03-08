import os
import logging
from src.tasks.celery_config import celery_app
from src.services.extractor_ytdlp import YtDlpExtractor
from src.services.extractor_scrapling import ScraplingExtractor
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = None
if SUPABASE_KEY and SUPABASE_KEY != "your_supabase_service_role_key_here":
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Warning: SUPABASE_SERVICE_ROLE_KEY is not set or is a placeholder in download_tasks.py. Database updates will be skipped.")

logger = logging.getLogger(__name__)

def update_job_status(job_id, status, download_url=None, error_message=None):
    if not job_id or not supabase:
        logger.info(f"Skipping DB update (job_id={job_id}, supabase={'yes' if supabase else 'no'}): status={status}")
        return
    
    data = {"status": status}
    if download_url:
        data["download_url"] = download_url
    if error_message:
        data["error_message"] = error_message
        
    supabase.table("download_jobs").update(data).eq("id", job_id).execute()

@celery_app.task(bind=True, max_retries=3)
def process_download(self, platform: str, url: str, job_id: str = None, sid: str = None):
    """
    Background task to extract media information.
    Attempts yt-dlp first, then falls back to Scrapling if blocked.
    Syncs results back to Supabase.
    """
    logger.info(f"Starting extraction for {url} (Platform: {platform}, Job: {job_id})")
    
    update_job_status(job_id, "processing")
    
    # 1. Fetch user tier for validation (skip if no supabase or job_id)
    user_tier = "free"
    if supabase and job_id:
        try:
            job_data = supabase.table("download_jobs").select("user_id").eq("id", job_id).single().execute()
            user_id = job_data.data.get("user_id") if job_data.data else None
            
            if user_id:
                user_profile = supabase.table("users").select("tier").eq("id", user_id).single().execute()
                user_tier = user_profile.data.get("tier", "free") if user_profile.data else "free"
        except Exception as e:
            logger.warning(f"Could not fetch user tier: {e}. Defaulting to 'free'.")

    try:
        # Step 2: Attempt extraction with yt-dlp
        extractor = YtDlpExtractor()
        
        # Check if it's a playlist
        if "list=" in url or "playlist" in url:
            if user_tier != "pro":
                msg = "Playlist downloading is only available for Pro users."
                update_job_status(job_id, "failed", error_message=msg)
                return {"status": "failed", "error": msg}

        info = extractor.extract_info(url)
        
        result = {
            "status": "completed",
            "url": info.get("url"),
            "title": info.get("title"),
            "thumbnail": info.get("thumbnail"),
            "duration": info.get("duration"),
            "ext": info.get("ext"),
        }
        
        update_job_status(job_id, "completed", download_url=result["url"])
        logger.info(f"Extraction completed for {url}: {result.get('title')}")
        return result

    except Exception as exc:
        logger.warning(f"Primary extraction failed for {url}: {str(exc)}. Attempting fallback...")
        
        try:
            # Step 3: Attempt fallback extraction with Scrapling
            fallback_extractor = ScraplingExtractor()
            result = fallback_extractor.extract_info(url)
            
            update_job_status(job_id, "completed", download_url=result.get("url"))
            return result
        except Exception as fallback_exc:
            logger.error(f"Fallback extraction also failed: {str(fallback_exc)}")
            
            update_job_status(job_id, "failed", error_message=str(fallback_exc))
            raise self.retry(exc=fallback_exc, countdown=5)

