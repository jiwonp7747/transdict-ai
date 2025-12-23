from pydantic import BaseModel
from typing import Optional, Any
from enum import Enum

class EventStatus(str, Enum):
    PROGRESS = "progress"
    RESULT = "result"
    ERROR = "error"
    DONE = "done"

class StreamResponse(BaseModel):
    data: Any
    status: EventStatus
    message: Optional[str] = None
