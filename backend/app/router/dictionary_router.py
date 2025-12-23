from typing import List, Optional
from fastapi import Depends, APIRouter, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exception.api_exception import ApiException
from app.common.response.code import SuccessCode, FailureCode
from app.common.response.response_template import ResponseTemplate
from app.db.database import get_db
from app.schema.dictionary_schema import DictionaryCreate, DictionaryUpdate, DictionaryResponse, DictionaryAiRequest
from app.svc import dictionary_service, context_service


router = APIRouter(prefix="/dictionary", tags=["dictionary"])

@router.post("/list", response_model=List[DictionaryResponse])
async def create_dictionaries(
    request: List[DictionaryCreate],
    db: AsyncSession = Depends(get_db),
):
    await dictionary_service.create_dictionaries(db, request)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, None)

@router.post("", response_model=DictionaryResponse)
async def create_dictionary(
    request: DictionaryCreate,
    db: AsyncSession = Depends(get_db),
):
    response = await dictionary_service.create_dictionary(db, request)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)

@router.post("/ai")
async def create_dict_by_ai(
    request: DictionaryAiRequest,
    db: AsyncSession = Depends(get_db),
):
    context =await context_service.get_context(db, request.context_id)
    if context is None:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "not found context_id")

    response = await dictionary_service.create_dictionary_by_ai(db, request)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.get("/context/{context_id}", response_model=List[DictionaryResponse])
async def get_dictionaries(
    context_id: Optional[int],
    db: AsyncSession = Depends(get_db),
):
    response = await dictionary_service.get_dictionaries(db, context_id)
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.get("/{dict_id}", response_model=DictionaryResponse)
async def get_dictionary(
    dict_id: int,
    db: AsyncSession = Depends(get_db),
):
    response = await dictionary_service.get_dictionary(db, dict_id)
    if not response:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "Dictionary not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.put("/{dict_id}", response_model=DictionaryResponse)
async def update_dictionary(
    dict_id: int,
    request: DictionaryUpdate,
    db: AsyncSession = Depends(get_db),
):
    response = await dictionary_service.update_dictionary(db, dict_id, request)
    if not response:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "Dictionary not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, response)


@router.delete("/{dict_id}")
async def delete_dictionary(
    dict_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await dictionary_service.delete_dictionary(db, dict_id)
    if not success:
        raise ApiException(FailureCode.NOT_FOUND_DATA, "Dictionary not found")
    return ResponseTemplate.success(SuccessCode.SUCCESS_CODE, {"message": "Dictionary deleted successfully"})
