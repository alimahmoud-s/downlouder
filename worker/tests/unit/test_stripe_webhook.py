import pytest
from unittest.mock import patch, MagicMock
from src.api.main import app # We'll need to define the webhook endpoint here or in a sub-module
from fastapi.testclient import TestClient
import json

client = TestClient(app)

@pytest.fixture
def mock_stripe_event():
    return {
        "id": "evt_test",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_123",
                "customer": "cus_abc123",
                "client_reference_id": "test-user-id",
                "payment_status": "paid",
            }
        }
    }

def test_webhook_signature_verification_failure():
    """
    Test that the webhook endpoint rejects requests with invalid signatures.
    """
    response = client.post(
        "/api/v1/webhook/stripe",
        content=json.dumps({"test": "data"}),
        headers={"Stripe-Signature": "invalid_signature"}
    )
    # Stripe library usually raises an error or we return 400
    assert response.status_code == 400

@patch("stripe.Webhook.construct_event")
def test_webhook_successful_subscription_sync(mock_construct, mock_stripe_event):
    """
    Test that a valid stripe event triggers the database sync logic.
    """
    mock_construct.return_value = mock_stripe_event
    
    # We'll need a mock for the supabase client in the webhook handler
    with patch("src.api.main.supabase") as mock_supabase:
        response = client.post(
            "/api/v1/webhook/stripe",
            content=json.dumps(mock_stripe_event),
            headers={"Stripe-Signature": "valid_sig"}
        )
        
        assert response.status_code == 200
        # Verify supabase was called to update the subscription
        mock_supabase.table.assert_called_with("user_subscriptions")
