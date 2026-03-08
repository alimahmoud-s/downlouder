import os
import asyncio
import stripe
import socketio
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from src.services.extractor_ytdlp import YtDlpExtractor

load_dotenv()

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = None
if SUPABASE_KEY and SUPABASE_KEY != "your_supabase_service_role_key_here":
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Supabase functionality will be limited.")

# Stripe Setup
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

app = FastAPI(title="Media Downloader API (Worker)")

# In-memory store for downloaded files (file_id -> file_path)
downloaded_files: dict[str, dict] = {}

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Socket.IO Server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.post("/api/v1/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('client_reference_id')
        
        if user_id and supabase:
            supabase.table("user_subscriptions").upsert({
                "user_id": user_id,
                "subscription_tier": "pro",
                "status": "active"
            }).execute()

    return {"status": "success"}

@app.get("/download/{file_id}")
async def download_file(file_id: str):
    """Serves a downloaded file to the browser."""
    file_info = downloaded_files.get(file_id)
    if not file_info or not os.path.exists(file_info["file_path"]):
        raise HTTPException(status_code=404, detail="File not found or expired")
    
    return FileResponse(
        path=file_info["file_path"],
        filename=f"{file_info['title']}.{file_info['ext']}",
        media_type="application/octet-stream",
    )

@sio.event
async def connect(sid, environ, auth):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def discover_playlist(sid, data):
    """Called by Pro users to preview items in a playlist."""
    url = data.get("url")
    print(f"Discovering playlist from {sid}: {url}")
    
    try:
        extractor = YtDlpExtractor()
        loop = asyncio.get_event_loop()
        items = await loop.run_in_executor(None, extractor.get_playlist_items, url)
        await sio.emit('playlist_discovered', {'items': items}, room=sid)
    except Exception as e:
        await sio.emit('download_failed', {'error': str(e)}, room=sid)

@sio.event
async def request_download(sid, data):
    """
    Step 1: Extracts available formats from the URL and sends them to the frontend.
    The frontend will then emit 'start_download' with the chosen format_id.
    """
    url = data.get("url")
    print(f"Received download request from {sid}: {url}")
    
    await sio.emit('download_progress', {'status': 'extracting', 'progress': 10}, room=sid)
    
    try:
        extractor = YtDlpExtractor()
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, extractor.extract_formats, url)
        
        print(f"Found {len(result['formats'])} formats for: {result['title']}")
        
        await sio.emit('formats_available', {
            'url': url,
            'title': result['title'],
            'thumbnail': result['thumbnail'],
            'duration': result['duration'],
            'formats': result['formats'],
        }, room=sid)
        
    except Exception as exc:
        print(f"Format extraction failed: {exc}")
        await sio.emit('download_failed', {'error': str(exc)}, room=sid)

@sio.event
async def start_download(sid, data):
    """
    Step 2: Downloads the media with the selected format and serves it via HTTP.
    """
    url = data.get("url")
    format_id = data.get("format_id")
    media_type = data.get("type", "video")  # "video" or "audio"
    
    print(f"Starting download for {sid}: {url} (format: {format_id}, type: {media_type})")
    
    await sio.emit('download_progress', {'status': 'downloading', 'progress': 30}, room=sid)
    
    try:
        extractor = YtDlpExtractor()
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, extractor.download_media, url, format_id, media_type)
        
        await sio.emit('download_progress', {'status': 'processing', 'progress': 90}, room=sid)
        
        # Store file reference for the download endpoint
        import uuid
        file_id = str(uuid.uuid4())[:12]
        downloaded_files[file_id] = {
            "file_path": result["file_path"],
            "title": result["title"],
            "ext": result["ext"],
        }
        
        # Build download URL that the browser can actually access
        download_url = f"http://localhost:8000/download/{file_id}"
        
        await sio.emit('download_complete', {
            'url': download_url,
            'title': result['title'],
            'ext': result['ext'],
        }, room=sid)
        
        print(f"Download ready: {result['title']} -> {download_url}")
        
        # Update Supabase if available
        if supabase:
            try:
                supabase.table("download_jobs").insert({
                    "source_url": url,
                    "platform": "generic",
                    "status": "completed",
                    "download_url": download_url,
                }).execute()
            except Exception as e:
                print(f"Warning: Supabase update failed: {e}")
        
    except Exception as exc:
        print(f"Download failed: {exc}")
        await sio.emit('download_failed', {'error': str(exc)}, room=sid)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.mount("/", socket_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")

