from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy import String, ForeignKey, TIMESTAMP, BigInteger, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


# Context Model
class Context(Base):
    __tablename__ = "CONTEXT"

    context_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    context_name: Mapped[Optional[str]] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    dictionaries: Mapped[List["Dictionary"]] = relationship(back_populates="context")


# Dictionary Model
class Dictionary(Base):
    __tablename__ = "DICTIONARY"

    dict_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    term_key: Mapped[Optional[str]] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String)
    context_id: Mapped[Optional[int]] = mapped_column(ForeignKey("CONTEXT.context_id", ondelete="CASCADE"))

    ko: Mapped[Optional[str]] = mapped_column(String)  # 한국어
    en: Mapped[Optional[str]] = mapped_column(String)  # 영어
    ch: Mapped[Optional[str]] = mapped_column(String)  # 중국어
    ve: Mapped[Optional[str]] = mapped_column(String)  # 베트남어
    ja: Mapped[Optional[str]] = mapped_column(String)  # 일본어

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    context: Mapped[Optional["Context"]] = relationship(back_populates="dictionaries")


class JsonTemplate(Base):
    __tablename__ = "JSON_TEMPLATE"

    template_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)  # 템플릿 이름
    description: Mapped[Optional[str]] = mapped_column(String(255))

    # JSON 설정을 저장하는 컬럼 (Python에서는 dict로 취급)
    format_config: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)

    # 확장자 (json, xml 등, 기본값 json)
    file_extension: Mapped[str] = mapped_column(String(10), server_default="json")

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )
