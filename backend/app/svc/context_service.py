import logging
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exception.api_exception import ApiException
from app.common.response.code import FailureCode
from app.db.models import Context
from app.schema.context_schema import ContextCreate, ContextUpdate, ContextResponse

logger = logging.getLogger(__name__)

async def create_context(db: AsyncSession, request: ContextCreate) -> ContextResponse:
    new_context = Context(**request.model_dump())
    db.add(new_context)
    await db.commit()
    await db.refresh(new_context)
    return ContextResponse.model_validate(new_context)


async def get_contexts(db: AsyncSession) -> List[ContextResponse]:
    result = await db.execute(select(Context).order_by(Context.created_at.desc()))
    contexts = result.scalars().all()
    return [ContextResponse.model_validate(context) for context in contexts]


async def get_context(db: AsyncSession, context_id: int) -> Optional[ContextResponse]:
    result = await db.execute(select(Context).where(Context.context_id == context_id))
    context = result.scalar_one_or_none()
    return ContextResponse.model_validate(context) if context else None


async def update_context(db: AsyncSession, context_id: int, request: ContextUpdate) -> Optional[ContextResponse]:
    result = await db.execute(select(Context).where(Context.context_id == context_id))
    context:Context = result.scalar_one_or_none()

    db_updated_at = context.updated_at.replace(tzinfo=None) if context.updated_at.tzinfo else context.updated_at
    request_updated_at = request.updated_at.replace(tzinfo=None) if request.updated_at.tzinfo else request.updated_at
    logger.info(f"request update timestamp: {request_updated_at}, db saved update timestamp: {db_updated_at}")

    if not context:
        return None

    if context.updated_at != request.updated_at:
        raise ApiException(
            FailureCode.CONFLICT,
            "The context has been modified by another user. Please refresh and try again."
        )

    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(context, key, value)

    await db.commit()
    await db.refresh(context)
    return ContextResponse.model_validate(context)


async def delete_context(db: AsyncSession, context_id: int) -> bool:
    result = await db.execute(select(Context).where(Context.context_id == context_id))
    context = result.scalar_one_or_none()

    if not context:
        return False

    await db.delete(context)
    await db.commit()
    return True
