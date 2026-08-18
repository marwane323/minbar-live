import logging
import json
from typing import Any, Dict
from .config import settings

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "service": settings.SERVICE_NAME,
            "message": record.getMessage(),
        }
        
        # Add custom fields if present
        for field in ["tenant_id", "session_id", "user_id", "latency_ms"]:
            if hasattr(record, field):
                log_data[field] = getattr(record, field)
                
        if record.exc_info:
            log_data["exc_info"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)

def setup_logging() -> None:
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
