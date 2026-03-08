import pytest
from src.services.extractor_ytdlp import YtDlpExtractor

# Mock URL for a public video
MOCK_PUBLIC_YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

@pytest.fixture
def extractor():
    return YtDlpExtractor()

def test_extract_public_youtube_url(extractor):
    """
    Test that the yt-dlp extractor can successfully retrieve information
    for a public YouTube video without downloading the file.
    """
    result = extractor.extract_info(MOCK_PUBLIC_YOUTUBE_URL)
    
    assert result is not None
    assert "url" in result, "Extracted dictionary must contain a direct download URL"
    assert "title" in result, "Extracted dictionary must contain a title"
    assert "Rick Astley" in result.get("title", ""), "Title should match the expected video"
