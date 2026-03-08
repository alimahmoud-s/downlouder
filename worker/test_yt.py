import yt_dlp
import sys

opts = {
    'extractor_args': {'youtube': {'player_client': ['ios', 'web']}},
    'nocheckcertificate': True,
    'http_headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    'quiet': False,
    'no_warnings': False
}

try:
    with open('test_output.txt', 'w', encoding='utf-8') as f:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(sys.argv[1], download=False)
            f.write(f"Success! Found formats: {len(info.get('formats', []))}\n")
            for fmt in info.get('formats', []):
                f.write(f"{fmt.get('format_id')} {fmt.get('ext')} {fmt.get('height')} {fmt.get('vcodec')} {fmt.get('acodec')}\n")
except Exception as e:
    with open('test_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"Error: {e}\n")
