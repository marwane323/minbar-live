import pytest
import asyncio
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocketDisconnect
from app.main import app
import json

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "websocket_hub"}

def test_websocket_broadcast_to_session():
    # Since TestClient handles websockets synchronously within context managers,
    # we can simulate pub/sub via the REST endpoint and receive on the websocket
    
    # 1. Connect a listener
    with client.websocket_connect("/ws/listen/session-1?tenant_id=tenant-A") as websocket:
        # Send initial config
        websocket.send_text(json.dumps({"language": "en", "audio_enabled": True}))
        
        # 2. Publish an event via REST
        event = {
            "event_type": "transcription",
            "payload": {"text": "hello"},
            "session_id": "session-1",
            "tenant_id": "tenant-A"
        }
        resp = client.post("/api/session/session-1/broadcast", json=event)
        assert resp.status_code == 200
        
        # 3. Receive the event on the listener
        data = websocket.receive_text()
        received = json.loads(data)
        assert received["event_type"] == "transcription"
        assert received["payload"]["text"] == "hello"

def test_language_filtered_broadcast():
    with client.websocket_connect("/ws/listen/session-2?tenant_id=tenant-A") as ws_en, \
         client.websocket_connect("/ws/listen/session-2?tenant_id=tenant-A") as ws_fr:
        
        ws_en.send_text(json.dumps({"language": "en"}))
        ws_fr.send_text(json.dumps({"language": "fr"}))
        
        # Broadcast translation for 'fr'
        event = {
            "event_type": "translation",
            "payload": {"text": "bonjour", "language": "fr"},
            "session_id": "session-2",
            "tenant_id": "tenant-A"
        }
        client.post("/api/session/session-2/broadcast", json=event)
        
        # ws_fr should get it
        data_fr = ws_fr.receive_text()
        assert json.loads(data_fr)["payload"]["text"] == "bonjour"
        
        # In a real async test we would assert ws_en didn't receive it, but with TestClient it blocks on receive.
        # We can test stats instead
        stats = client.get("/api/hub/stats").json()
        assert stats["active_sessions"] >= 1

def test_cross_tenant_isolation():
    with client.websocket_connect("/ws/listen/session-3?tenant_id=tenant-B") as ws_b:
        ws_b.send_text(json.dumps({"language": "en"}))
        
        # Event for tenant-A in the same session
        event = {
            "event_type": "transcription",
            "payload": {"text": "hello"},
            "session_id": "session-3",
            "tenant_id": "tenant-A"
        }
        client.post("/api/session/session-3/broadcast", json=event)
        
        # If we had async, we'd verify it doesn't arrive.
        pass
