from .schemas import BroadcastEvent
from .connection_manager import manager
import logging

logger = logging.getLogger(__name__)

class EventRouter:
    @staticmethod
    async def route_event(event: BroadcastEvent):
        logger.debug(f"Routing event type {event.event_type} for session {event.session_id}")
        
        if event.event_type in ("transcription", "alignment", "quran_detection", "session_start", "session_end"):
            await manager.broadcast_to_session(event.session_id, event)
            
        elif event.event_type == "translation":
            language = event.payload.get("language")
            if language:
                await manager.broadcast_filtered(event.session_id, event, language)
            else:
                logger.warning(f"Translation event missing language in payload: {event.session_id}")
                
        elif event.event_type == "tts_ready":
            await manager.broadcast_audio_ready(event.session_id, event)
            
        else:
            logger.warning(f"Unknown event type {event.event_type} for session {event.session_id}")
