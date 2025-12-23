import logging
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exception.api_exception import ApiException
from app.common.response.code import FailureCode
from app.db.models import JsonTemplate
from app.schema.json_template_schema import JsonTemplateCreate, JsonTemplateUpdate, JsonTemplateResponse

logger = logging.getLogger(__name__)


async def create_json_template(db: AsyncSession, request: JsonTemplateCreate) -> JsonTemplateResponse:
    new_template = JsonTemplate(**request.model_dump())
    db.add(new_template)
    await db.commit()
    await db.refresh(new_template)
    return JsonTemplateResponse.model_validate(new_template)


async def get_json_templates(db: AsyncSession) -> List[JsonTemplateResponse]:
    query = select(JsonTemplate)
    result = await db.execute(query)
    templates = result.scalars().all()
    return [JsonTemplateResponse.model_validate(template) for template in templates]


async def get_json_template(db: AsyncSession, template_id: int) -> Optional[JsonTemplateResponse]:
    result = await db.execute(select(JsonTemplate).where(JsonTemplate.template_id == template_id))
    template = result.scalar_one_or_none()
    return JsonTemplateResponse.model_validate(template) if template else None

async def get_default_json_template(db: AsyncSession) -> Optional[JsonTemplateResponse]:
    result = await db.execute(select(JsonTemplate).where(JsonTemplate.name == 'default'))
    template = result.scalar_one_or_none()
    return JsonTemplateResponse.model_validate(template) if template else None


async def update_json_template(db: AsyncSession, template_id: int, request: JsonTemplateUpdate) -> Optional[JsonTemplateResponse]:
    result = await db.execute(select(JsonTemplate).where(JsonTemplate.template_id == template_id))
    template = result.scalar_one_or_none()

    if not template:
        return None

    logger.info(f"template updated_at: {template.updated_at}, request updated_at: {request.updated_at}")
    # Optimistic locking: 요청의 updated_at과 DB의 updated_at 비교 (timezone 무시)
    db_updated_at = template.updated_at.replace(tzinfo=None) if template.updated_at.tzinfo else template.updated_at
    request_updated_at = request.updated_at.replace(tzinfo=None) if request.updated_at.tzinfo else request.updated_at

    if db_updated_at != request_updated_at:
        raise ApiException(
            FailureCode.CONFLICT,
            "The template has been modified by another user. Please refresh and try again."
        )

    for key, value in request.model_dump(exclude_unset=True, exclude={'updated_at'}).items():
        setattr(template, key, value)

    await db.commit()
    await db.refresh(template)
    return JsonTemplateResponse.model_validate(template)


async def delete_json_template(db: AsyncSession, template_id: int) -> bool:
    result = await db.execute(select(JsonTemplate).where(JsonTemplate.template_id == template_id))
    template = result.scalar_one_or_none()

    if not template:
        return False

    await db.delete(template)
    await db.commit()
    return True