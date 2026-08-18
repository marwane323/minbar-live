import json
import logging
import asyncio
from typing import Callable, Awaitable, Dict, List
from .schemas import BroadcastEvent
from .event_router import EventRouter

logger = logging.getLogger(__name__)

class RedisPubSub:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[str], Awaitable[None]]]] = {}
        self.is_connected = False

    async def connect(self, redis_url: str | None = None):
        self.is_connected = True
        logger.info("PubSub connected (mock mode)")

    async def disconnect(self):
        self.is_connected = False
        logger.info("PubSub disconnected")

    async def subscribe(self, channel: str, callback: Callable[[str], Awaitable[None]]):
        if channel not in self._subscribers:
            self._subscribers[channel] = []
        self._subscribers[channel].append(callback)
        logger.info(f"Subscribed to channel: {channel}")

    async def publish(self, channel: str, message: str):
        if channel in self._subscribers:
            for callback in self._subscribers[channel]:
                asyncio.create_task(callback(message))

pubsub = RedisPubSub()

async def handle_pubsub_message(message: str):
    try:
        data = json.loads(message)
        event = BroadcastEvent(**data)
        await EventRouter.route_event(event)
    except Exception as e:
        logger.error(f"Error handling pubsub message: {e}")
