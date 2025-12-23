from typing import List
from fastapi import Depends, APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exception.api_exception import ApiException
from app.common.response.code import SuccessCode, FailureCode
from app.common.response.response_template import ResponseTemplate
from app.db.database import get_db
from app.schema.context_schema import ContextCreate, ContextUpdate, ContextResponse
from app.svc import context_service


router = APIRouter(prefix="/context", tags=["context"])


@router.post("", response_model=ContextResponse)
async def create_context(
    request: ContextCreate,
    db: AsyncSession = Depends(get_db),
):
    response = await context_service.create_context(db, request)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.get("", response_model=List[ContextResponse])
async def get_contexts(
    db: AsyncSession = Depends(get_db),
):
    response = await context_service.get_contexts(db)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.get("/{context_id}", response_model=ContextResponse)
async def get_context(
    context_id: int,
    db: AsyncSession = Depends(get_db),
):
    response = await context_service.get_context(db, context_id)
    if not response:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "Context not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.put("/{context_id}", response_model=ContextResponse)
async def update_context(
    context_id: int,
    request: ContextUpdate,
    db: AsyncSession = Depends(get_db),
):
    response = await context_service.update_context(db, context_id, request)
    if not response:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "Context not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.delete("/{context_id}")
async def delete_context(
    context_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await context_service.delete_context(db, context_id)
    if not success:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "Context not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, {"message": "Context deleted successfully"})
