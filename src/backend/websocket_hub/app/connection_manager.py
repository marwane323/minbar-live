import asyncio
from typing import Dict, List
from fastapi import WebSocket
import logging
from .schemas import ListenerConnection, SessionRoom, HubStats, BroadcastEvent

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_info: Dict[str, ListenerConnection] = {}
        self.sessions: Dict[str, SessionRoom] = {}
        self.lock = asyncio.Lock()
        
        self._message_count = 0
        try:
            self._stats_last_reset = asyncio.get_event_loop().time()
        except RuntimeError:
            self._stats_last_reset = 0

    async def connect(self, websocket: WebSocket, session_id: str, tenant_id: str, language: str | None = None, audio_enabled: bool = False) -> str:
        connection_id = str(id(websocket))
        
        async with self.lock:
            self.active_connections[connection_id] = websocket
            self.connection_info[connection_id] = ListenerConnection(
                connection_id=connection_id,
                session_id=session_id,
                tenant_id=tenant_id,
                language_preference=language,
                audio_enabled=audio_enabled
            )
            
            if session_id not in self.sessions:
                self.sessions[session_id] = SessionRoom(session_id=session_id, tenant_id=tenant_id)
            
            self.sessions[session_id].listeners.add(connection_id)
            
        logger.info(f"Client connected: {connection_id} to session {session_id}")
        return connection_id

    async def disconnect(self, connection_id: str):
        async with self.lock:
            if connection_id in self.active_connections:
                del self.active_connections[connection_id]
            
            if connection_id in self.connection_info:
                info = self.connection_info.pop(connection_id)
                session_id = info.session_id
                
                if session_id in self.sessions:
                    self.sessions[session_id].listeners.discard(connection_id)
                    if not self.sessions[session_id].listeners:
                        del self.sessions[session_id]
                        
        logger.info(f"Client disconnected: {connection_id}")

    async def broadcast_to_session(self, session_id: str, event: BroadcastEvent):
        listeners = await self.get_session_listeners(session_id)
        valid_listeners = [
            cid for cid in listeners 
            if cid in self.connection_info and self.connection_info[cid].tenant_id == event.tenant_id
        ]
        await self._broadcast(valid_listeners, event)

    async def broadcast_filtered(self, session_id: str, event: BroadcastEvent, language: str):
        listeners = await self.get_session_listeners(session_id)
        valid_listeners = [
            cid for cid in listeners 
            if cid in self.connection_info 
            and self.connection_info[cid].tenant_id == event.tenant_id
            and self.connection_info[cid].language_preference == language
        ]
        await self._broadcast(valid_listeners, event)

    async def broadcast_audio_ready(self, session_id: str, event: BroadcastEvent):
        listeners = await self.get_session_listeners(session_id)
        valid_listeners = [
            cid for cid in listeners 
            if cid in self.connection_info 
            and self.connection_info[cid].tenant_id == event.tenant_id
            and self.connection_info[cid].audio_enabled
        ]
        await self._broadcast(valid_listeners, event)

    async def get_session_listeners(self, session_id: str) -> List[str]:
        async with self.lock:
            if session_id in self.sessions:
                return list(self.sessions[session_id].listeners)
            return []

    async def _broadcast(self, connection_ids: List[str], event: BroadcastEvent):
        if not connection_ids:
            return
            
        message = event.model_dump_json()
        
        async with self.lock:
            self._message_count += len(connection_ids)
            
        tasks = []
        for cid in connection_ids:
            if cid in self.active_connections:
                tasks.append(self.active_connections[cid].send_text(message))
                
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for cid, result in zip(connection_ids, results):
                if isinstance(result, Exception):
                    logger.warning(f"Failed to send to {cid}: {result}")

    async def get_stats(self) -> HubStats:
        async with self.lock:
            try:
                current_time = asyncio.get_event_loop().time()
            except RuntimeError:
                current_time = 0
                
            elapsed = current_time - self._stats_last_reset
            
            if elapsed > 0:
                mps = self._message_count / elapsed
            else:
                mps = 0.0
                
            if elapsed > 60:
                self._message_count = 0
                self._stats_last_reset = current_time
                
            return HubStats(
                total_connections=len(self.active_connections),
                active_sessions=len(self.sessions),
                messages_per_second=mps
            )

manager = ConnectionManager()
