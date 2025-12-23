from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ContextBase(BaseModel):
    context_name: Optional[str] = None
    description: Optional[str] = None


class ContextCreate(ContextBase):
    pass


class ContextUpdate(BaseModel):
    context_name: Optional[str] = None
    description: Optional[str] = None
    updated_at: datetime


class ContextResponse(ContextBase):
    context_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
