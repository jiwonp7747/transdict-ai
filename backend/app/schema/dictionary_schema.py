from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class DictionaryAiRequest(BaseModel):
    context_id: int
    content: str
    language: str
    term_key: Optional[str]
    description: Optional[str]


class DictionaryBase(BaseModel):
    term_key: Optional[str] = None
    description: Optional[str] = None
    context_id: Optional[int] = None
    ko: Optional[str] = None
    en: Optional[str] = None
    ch: Optional[str] = None
    ve: Optional[str] = None
    ja: Optional[str] = None


class DictionaryCreate(DictionaryBase):
    pass


class DictionaryUpdate(BaseModel):
    term_key: Optional[str] = None
    description: Optional[str] = None
    context_id: Optional[int] = None
    ko: Optional[str] = None
    en: Optional[str] = None
    ch: Optional[str] = None
    ve: Optional[str] = None
    ja: Optional[str] = None
    updated_at: datetime


class DictionaryResponse(DictionaryBase):
    dict_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# 3. SSE로 내려줄 데이터 스키마 (DB 모델 아님)
class DictionaryProposal(BaseModel):
    term_key: str
    ko: str
    en: str
    ch: str
    ve: str
    ja: str