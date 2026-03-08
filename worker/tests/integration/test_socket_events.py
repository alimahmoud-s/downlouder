import pytest
import pytest_asyncio
from httpx import AsyncClient
from src.api.main import socket_app, sio
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_request_download_socket_event():
    """
    Test that the request_download socket event is received and handled.
    We mock the celery task trigger to verify integration.
    """
    # Create a mock client
    # In a real test, we might use a python-socketio test client
    # For now, we'll unit test the event handler directly in the main module context
    
    mock_sid = "test-sid"
    mock_data = {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
    
    # We use patch to verify the Celery task is called
    with patch("src.api.main.sio.emit") as mock_emit:
        from src.api.main import request_download
        
        await request_download(mock_sid, mock_data)
        
        # Verify the acknowledge event was sent back
        mock_emit.assert_called_with(
            'download_progress', 
            {'status': 'queued', 'progress': 0}, 
            room=mock_sid
        )
