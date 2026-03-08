import yt_dlp
import os
import tempfile
import uuid

# Common headers to avoid 403
COMMON_OPTS = {
    'quiet': True,
    'no_warnings': True,
    'http_headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-us,en;q=0.5',
    },
    'nocheckcertificate': True,
    'extractor_args': {
        'youtube': {
            'player_client': ['ios', 'web']
        }
    },
    # Ensure it doesn't crash evaluating 'best' when only split formats exist
    'format': 'bestvideo+bestaudio/best',
}

class YtDlpExtractor:
    def __init__(self):
        self.ydl_opts = {
            **COMMON_OPTS,
            'extract_flat': False,
            'skip_download': True,
        }

    def get_playlist_items(self, url: str) -> list:
        """Extracts metadata for all items in a playlist."""
        opts = {**self.ydl_opts, 'extract_flat': True}
        
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                playlist_info = ydl.extract_info(url, download=False)
                
                if 'entries' not in playlist_info:
                    return []
                
                items = []
                for entry in playlist_info['entries']:
                    if not entry: continue
                    items.append({
                        "id": entry.get("id"),
                        "title": entry.get("title"),
                        "thumbnail": entry.get("thumbnail") or (entry.get("thumbnails")[0]["url"] if entry.get("thumbnails") else None),
                        "duration": str(entry.get("duration", "0:00")),
                        "url": entry.get("url") or f"https://www.youtube.com/watch?v={entry.get('id')}"
                    })
                return items
        except Exception as e:
            raise ValueError(f"Failed to discover playlist items: {str(e)}")

    def extract_info(self, url: str) -> dict:
        """Extracts media info from a given URL without downloading."""
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                return ydl.extract_info(url, download=False)
        except Exception as e:
            raise ValueError(f"Failed to extract info via yt-dlp: {str(e)}")

    def extract_formats(self, url: str) -> dict:
        """
        Extracts available formats and video metadata.
        Returns structured format options for the frontend.
        """
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                formats = []
                seen = set()
                
                for f in info.get('formats', []):
                    format_id = f.get('format_id', '')
                    ext = f.get('ext', 'mp4')
                    height = f.get('height')
                    vcodec = f.get('vcodec', 'none')
                    acodec = f.get('acodec', 'none')
                    filesize = f.get('filesize') or f.get('filesize_approx')
                    tbr = f.get('tbr', 0)
                    
                    has_video = vcodec != 'none'
                    has_audio = acodec != 'none'
                    
                    if has_video:
                        if not height:
                            continue
                        label = f"{height}p"
                        media_type = "video"
                    elif has_audio and not has_video:
                        abr = f.get('abr', tbr)
                        label = f"{int(abr)}kbps" if abr else ext
                        media_type = "audio"
                    else:
                        continue
                    
                    key = f"{media_type}_{label}"
                    if key in seen:
                        continue
                    seen.add(key)
                    
                    formats.append({
                        "format_id": format_id,
                        "ext": ext,
                        "label": label,
                        "type": media_type,
                        "height": height,
                        "filesize": filesize,
                        "tbr": tbr,
                    })
                
                video_formats = sorted(
                    [f for f in formats if f['type'] == 'video'],
                    key=lambda x: x.get('height') or 0, reverse=True
                )
                audio_formats = sorted(
                    [f for f in formats if f['type'] == 'audio'],
                    key=lambda x: x.get('tbr') or 0, reverse=True
                )
                
                return {
                    "title": info.get("title", "Unknown"),
                    "thumbnail": info.get("thumbnail"),
                    "duration": info.get("duration"),
                    "formats": video_formats + audio_formats,
                }
        except Exception as e:
            raise ValueError(f"Failed to extract formats via yt-dlp: {str(e)}")

    def download_media(self, url: str, format_id: str, media_type: str = "video") -> dict:
        """
        Downloads the media with the specified format to a temp file.
        For video: merges with best audio. For audio: extracts audio only.
        """
        download_dir = os.path.join(tempfile.gettempdir(), "downlouder")
        os.makedirs(download_dir, exist_ok=True)
        
        file_id = str(uuid.uuid4())[:8]
        output_template = os.path.join(download_dir, f"{file_id}_%(title).50s.%(ext)s")
        
        if media_type == "video":
            # Try selected format + best audio, fallback to best combined
            format_spec = f"{format_id}+bestaudio[ext=m4a]/{format_id}+bestaudio/{format_id}/bestvideo+bestaudio/best"
        elif media_type == "audio":
            format_spec = format_id
        else:
            format_spec = "best"
        
        opts = {
            **COMMON_OPTS,
            'format': format_spec,
            'outtmpl': output_template,
            'skip_download': False,
        }
        
        if media_type == 'video':
            opts['merge_output_format'] = 'mp4'
        elif media_type == 'audio':
            opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }]
        
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=True)
                
                filename = ydl.prepare_filename(info)
                
                # Check for merged/converted output
                for candidate_ext in ['mp4', 'mp3', 'webm', 'mkv']:
                    candidate = os.path.splitext(filename)[0] + '.' + candidate_ext
                    if os.path.exists(candidate):
                        filename = candidate
                        break
                
                ext = os.path.splitext(filename)[1].lstrip('.')
                
                return {
                    "file_path": filename,
                    "title": info.get("title", "download"),
                    "ext": ext or "mp4",
                }
        except Exception as e:
            raise ValueError(f"Failed to download media: {str(e)}")
