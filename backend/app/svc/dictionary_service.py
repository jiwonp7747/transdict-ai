import logging
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.client.openai_client import aclient
from app.common.exception.api_exception import ApiException
from app.common.response.code import FailureCode
from app.db.models import Dictionary
from app.schema.ai_schema import MultiLanguageTranslation
from app.schema.dictionary_schema import DictionaryCreate, DictionaryUpdate, DictionaryResponse, DictionaryAiRequest

logger = logging.getLogger(__name__)


async def create_dictionary(db: AsyncSession, request: DictionaryCreate) -> DictionaryResponse:
    new_dictionary = Dictionary(**request.model_dump())
    db.add(new_dictionary)
    await db.commit()
    await db.refresh(new_dictionary)
    return DictionaryResponse.model_validate(new_dictionary)

async def create_dictionaries(db: AsyncSession, request: List[DictionaryCreate]):
    new_dictionaries = [ Dictionary(**dict_create.model_dump()) for dict_create in request]
    db.add_all(new_dictionaries)
    await db.commit()
    return

async def get_dictionaries(db: AsyncSession, context_id: Optional[int] = None) -> List[DictionaryResponse]:
    query = select(Dictionary)
    if context_id is not None:
        query = query.where(Dictionary.context_id == context_id)

    result = await db.execute(query)
    dictionaries = result.scalars().all()
    return [DictionaryResponse.model_validate(dictionary) for dictionary in dictionaries]


async def get_dictionary(db: AsyncSession, dict_id: int) -> Optional[DictionaryResponse]:
    result = await db.execute(select(Dictionary).where(Dictionary.dict_id == dict_id))
    dictionary = result.scalar_one_or_none()
    return DictionaryResponse.model_validate(dictionary) if dictionary else None


async def update_dictionary(db: AsyncSession, dict_id: int, request: DictionaryUpdate) -> Optional[DictionaryResponse]:
    result = await db.execute(select(Dictionary).where(Dictionary.dict_id == dict_id))
    dictionary = result.scalar_one_or_none()

    if not dictionary:
        return None

    logger.info(f"dic updated_at: {dictionary.updated_at}, request updated_at: {request.updated_at}")
    # Optimistic locking: 요청의 updated_at과 DB의 updated_at 비교 (timezone 무시)
    db_updated_at = dictionary.updated_at.replace(tzinfo=None) if dictionary.updated_at.tzinfo else dictionary.updated_at
    request_updated_at = request.updated_at.replace(tzinfo=None) if request.updated_at.tzinfo else request.updated_at

    if db_updated_at != request_updated_at:
        raise ApiException(
            FailureCode.CONFLICT,
            "The dictionary has been modified by another user. Please refresh and try again."
        )

    for key, value in request.model_dump(exclude_unset=True, exclude={'updated_at'}).items():
        setattr(dictionary, key, value)

    await db.commit()
    await db.refresh(dictionary)
    return DictionaryResponse.model_validate(dictionary)


async def delete_dictionary(db: AsyncSession, dict_id: int) -> bool:
    result = await db.execute(select(Dictionary).where(Dictionary.dict_id == dict_id))
    dictionary = result.scalar_one_or_none()

    if not dictionary:
        return False

    await db.delete(dictionary)
    await db.commit()
    return True


async def create_dictionary_by_ai(db, request: DictionaryAiRequest) -> DictionaryResponse:
    lang_map = {
        "ko": "Korean",
        "en": "English",
        "ch": "Chinese",
        "ve": "Vietnamese",
        "ja": "Japanese"
    }

    if request.language not in lang_map:
        raise ApiException(FailureCode.BAD_REQUEST, "not support language for ai translation")

    source_lang_name = lang_map[request.language]

    system_prompt = (
        "You are an expert UI/UX localizer.\n"
        "Translate the given source text into 5 languages: Korean, English, Chinese, Vietnamese, and Japanese.\n"
        "Ensure the tone is consistent with the provided context."
    )

    user_prompt = f"""
        [Source Language]: {source_lang_name} ({request.language})
        [Source Text]: "{request.content}"
        [Context]: {request.description or "General UI term"}
        """

    try:
        # 3. OpenAI 호출 (Structured Output)
        response = await aclient.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",  # Structured Output 지원 모델
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format=MultiLanguageTranslation,  # 👈 Pydantic 모델 주입!
        )

        # 4. 결과 파싱
        ai_result: MultiLanguageTranslation = response.choices[0].message.parsed

    except Exception as e:
        # AI 호출 실패 시 로그 찍고 에러 처리
        print(f"AI Error: {e}")
        raise ApiException(FailureCode.INTERNAL_SERVER_ERROR, "AI Translation Failed")

    setattr(ai_result, request.language, request.content)

    # 6. DB 객체 생성
    new_dict = Dictionary(
        term_key=request.term_key,
        description=request.description,
        context_id=request.context_id,

        # Pydantic 객체에서 값 꺼내기
        ko=ai_result.ko,
        en=ai_result.en,
        ch=ai_result.ch,
        ve=ai_result.ve,
        ja=ai_result.ja,
    )

    db.add(new_dict)
    await db.commit()
    await db.refresh(new_dict)

    return new_dict

async def generate_translation_proposal(request: DictionaryAiRequest) -> dict:
    """
    DB에 저장하지 않고 번역 결과만 제안(Proposal)합니다.
    """
    lang_map = {
        "ko": "Korean", "en": "English", "ch": "Chinese",
        "ve": "Vietnamese", "ja": "Japanese"
    }

    if request.language not in lang_map:
        # SSE 내부에서는 에러를 raise 하기보다 에러 결과값을 리턴하는 게 흐름상 안전할 수 있으나,
        # 여기서는 예외 처리를 상위에서 잡도록 하겠습니다.
        raise ValueError(f"Unsupported language: {request.language}")

    source_lang_name = lang_map[request.language]

    system_prompt = (
        "You are an expert UI/UX localizer.\n"
        "Translate the given source text into 5 languages: Korean, English, Chinese, Vietnamese, and Japanese.\n"
        "Ensure the tone is consistent with the provided context."
    )

    user_prompt = f"""
        [Source Language]: {source_lang_name} ({request.language})
        [Source Text]: "{request.content}"
        [Context]: {request.description or "General UI term"}
        """

    try:
        response = await aclient.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format=MultiLanguageTranslation,
        )
        ai_result = response.choices[0].message.parsed
    except Exception as e:
        print(f"AI Error: {e}")
        # 실패 시 빈 값이나 에러 정보를 담을 수도 있음. 여기서는 재시도 로직 없이 에러 전파
        raise e

    # 원본 데이터 덮어쓰기 (무결성 보장)
    setattr(ai_result, request.language, request.content)

    # 결과 반환 (DictionaryProposal 스키마와 매핑될 dict 구조)
    return {
        "term_key": request.term_key,
        "ko": ai_result.ko,
        "en": ai_result.en,
        "ch": ai_result.ch,
        "ve": ai_result.ve,
        "ja": ai_result.ja,
    }