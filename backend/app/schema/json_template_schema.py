from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class JsonTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    format_config: Dict[str, Any]
    file_extension: str = "json"


class JsonTemplateCreate(JsonTemplateBase):
    pass


class JsonTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    format_config: Optional[Dict[str, Any]] = None
    updated_at: datetime


class JsonTemplateResponse(JsonTemplateBase):
    template_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)