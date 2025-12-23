from typing import List, Optional
from fastapi import Depends, APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exception.api_exception import ApiException
from app.common.response.code import SuccessCode, FailureCode
from app.common.response.response_template import ResponseTemplate
from app.db.database import get_db
from app.schema.json_template_schema import JsonTemplateCreate, JsonTemplateUpdate, JsonTemplateResponse
from app.svc import json_template_service


router = APIRouter(prefix="/json-template", tags=["json-template"])


@router.post("", response_model=JsonTemplateResponse)
async def create_json_template(
    request: JsonTemplateCreate,
    db: AsyncSession = Depends(get_db),
):
    response = await json_template_service.create_json_template(db, request)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.get("", response_model=List[JsonTemplateResponse])
async def get_json_templates(
    db: AsyncSession = Depends(get_db),
):
    response = await json_template_service.get_json_templates(db)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.get("/default", response_model=JsonTemplateResponse)
async def get_default_json_template(
    db: AsyncSession = Depends(get_db),
):
    response = await json_template_service.get_default_json_template(db)
    if not response:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "JsonTemplate not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)

@router.get("/{template_id}", response_model=JsonTemplateResponse)
async def get_json_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
):
    response = await json_template_service.get_json_template(db, template_id)
    if not response:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "JsonTemplate not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.put("/{template_id}", response_model=JsonTemplateResponse)
async def update_json_template(
    template_id: int,
    request: JsonTemplateUpdate,
    db: AsyncSession = Depends(get_db),
):
    response = await json_template_service.update_json_template(db, template_id, request)
    if not response:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "JsonTemplate not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.delete("/{template_id}")
async def delete_json_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await json_template_service.delete_json_template(db, template_id)
    if not success:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "JsonTemplate not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, {"message": "JsonTemplate deleted successfully"})