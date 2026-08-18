from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from shared.logging import setup_logging
from shared.config import settings
from .connection_manager import manager
from .schemas import BroadcastEvent, HubStats
from .pubsub import pubsub, handle_pubsub_message
import json
import logging
from contextlib import asynccontextmanager

setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await pubsub.connect()
    await pubsub.subscribe("hub:events", handle_pubsub_message)
    yield
    await pubsub.disconnect()

app = FastAPI(title=settings.SERVICE_NAME or "websocket_hub", lifespan=lifespan)

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "websocket_hub"}

@app.get("/api/hub/stats", response_model=HubStats)
async def get_stats():
    return await manager.get_stats()

@app.websocket("/ws/listen/{session_id}")
async def websocket_listen(
    websocket: WebSocket, 
    session_id: str, 
    tenant_id: str = Query(...), 
):
    await websocket.accept()
    
    try:
        config_data = await websocket.receive_text()
        config = json.loads(config_data)
        language = config.get("language")
        audio_enabled = config.get("audio_enabled", False)
    except Exception:
        language = None
        audio_enabled = False
        
    connection_id = await manager.connect(
        websocket, 
        session_id=session_id, 
        tenant_id=tenant_id,
        language=language,
        audio_enabled=audio_enabled
    )
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if "language" in msg or "audio_enabled" in msg:
                    # Could update config here in a real impl
                    pass
            except Exception:
                pass
    except WebSocketDisconnect:
        await manager.disconnect(connection_id)

@app.websocket("/ws/publish/{session_id}")
async def websocket_publish(
    websocket: WebSocket,
    session_id: str,
    token: str | None = Query(None)
):
    # Basic rudimentary check
    if token != "secret":
        await websocket.close(code=1008)
        return
        
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                event_data = json.loads(data)
                event = BroadcastEvent(**event_data)
                await pubsub.publish("hub:events", event.model_dump_json())
            except Exception as e:
                logger.error(f"Invalid publish event: {e}")
                await websocket.send_json({"error": "Invalid event payload"})
    except WebSocketDisconnect:
        pass

@app.post("/api/session/{session_id}/broadcast")
async def broadcast_rest(session_id: str, event: BroadcastEvent):
    if event.session_id != session_id:
        raise HTTPException(status_code=400, detail="Session ID mismatch")
        
    await pubsub.publish("hub:events", event.model_dump_json())
    return {"status": "event_published"}
