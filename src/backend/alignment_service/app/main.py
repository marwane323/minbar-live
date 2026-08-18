from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from shared.logging import setup_logging
from shared.config import settings

from .schemas import AlignmentStartRequest, AlignmentState
from .session import session_store

setup_logging()

app = FastAPI(title=settings.SERVICE_NAME or "alignment_service")

class ProcessInputRequest(BaseModel):
    asr_text: str

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "alignment_service"}

@app.post("/api/align/start")
async def start_session(request: AlignmentStartRequest):
    if not request.segments:
        raise HTTPException(status_code=400, detail="Segments list cannot be empty for now.")
        
    session_id = session_store.create_session(request.script_id, request.segments)
    return {"session_id": session_id}

@app.post("/api/align/{session_id}/process")
async def process_text(session_id: str, request: ProcessInputRequest):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    event = await session.process_input(request.asr_text)
    if not event:
        return {"status": "ignored"}
    return event

@app.get("/api/align/{session_id}/state", response_model=AlignmentState)
async def get_state(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.get_state()

@app.post("/api/align/{session_id}/reset")
async def reset_session(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.engine.reset()
    return {"status": "reset"}

@app.delete("/api/align/{session_id}")
async def end_session(session_id: str):
    session_store.end_session(session_id)
    return {"status": "deleted"}

@app.websocket("/ws/align/{session_id}")
async def align_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    session = session_store.get_session(session_id)
    if not session:
        await websocket.close(code=1008, reason="Session not found")
        return
        
    try:
        while True:
            data = await websocket.receive_text()
            event = await session.process_input(data)
            if event:
                await websocket.send_json(event.model_dump())
    except WebSocketDisconnect:
        pass
