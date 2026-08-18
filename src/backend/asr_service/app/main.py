from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, UploadFile, File, HTTPException
import logging
import time
import json
from shared.logging import setup_logging
from shared.config import settings
from shared.auth import get_current_user  # Assuming shared.auth exists
from app.schemas import ASRConfig, ASREvent, TranscriptionSegment
from app.engine import CohereASREngine, WhisperASREngine
from app.session import session_manager
from app.audio import preprocess_audio, detect_silence

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.SERVICE_NAME or "asr_service")

# Global engine instances
cohere_engine = CohereASREngine()
whisper_engine = WhisperASREngine()

@app.on_event("startup")
async def startup_event():
    await cohere_engine.initialize()
    await whisper_engine.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    await cohere_engine.cleanup()
    await whisper_engine.cleanup()

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "asr_service", "active_sessions": session_manager.get_active_count()}

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # 1. First message must be ASRConfig JSON
    try:
        config_msg = await websocket.receive_text()
        config_data = json.loads(config_msg)
        config = ASRConfig(**config_data)
        # Mock tenant_id for WS
        tenant_id = "ws_tenant"
    except Exception as e:
        logger.error(f"Failed to parse ASRConfig: {e}")
        await websocket.close(code=1003)
        return

    session = session_manager.create_session(tenant_id, config)
    logger.info(f"Started ASR session {session.session_id} for tenant {tenant_id}")
    
    engine = whisper_engine if config.model == "whisper-v3-turbo" else cohere_engine

    try:
        while True:
            # 2. Receive binary audio chunk
            audio_chunk = await websocket.receive_bytes()
            
            if detect_silence(audio_chunk):
                # Skip silent chunks to save processing
                continue

            # 3. Transcribe and stream results
            async for event in engine.transcribe_chunk(audio_chunk, config):
                if event.segment:
                    session.add_segment(event.segment)
                await websocket.send_text(event.model_dump_json())

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session.session_id}")
    except Exception as e:
        logger.error(f"Error in ASR session {session.session_id}: {e}")
        try:
            await websocket.send_text(ASREvent(event_type="error", error=str(e)).model_dump_json())
            await websocket.close(code=1011)
        except:
            pass
    finally:
        latency = time.time() - session.start_time
        logger.info(f"Ended ASR session {session.session_id}. Duration: {latency:.2f}s")
        session_manager.end_session(session.session_id)

@app.post("/api/transcribe")
async def transcribe_file(
    file: UploadFile = File(...),
    config: str = "{}", # JSON string
    # user = Depends(get_current_user) # Assuming get_current_user is mockable or present
) -> dict:
    try:
        config_obj = ASRConfig(**json.loads(config))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid config: {e}")

    engine = whisper_engine if config_obj.model == "whisper-v3-turbo" else cohere_engine
    
    raw_audio = await file.read()
    processed_audio = preprocess_audio(raw_audio)
    
    segments = []
    async for event in engine.transcribe_chunk(processed_audio, config_obj):
        if event.segment:
            segments.append(event.segment.model_dump())
            
    return {
        "status": "success",
        "segments": segments
    }

