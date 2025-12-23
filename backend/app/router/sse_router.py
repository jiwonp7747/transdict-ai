import asyncio
import json
from typing import List

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from app.schema.dictionary_schema import DictionaryAiRequest
from app.schema.sse_schema import StreamResponse, EventStatus
from app.svc import dictionary_service
from app.util.sse_util import SSEFormatter

router = APIRouter(prefix="/sse", tags=["SSE"])

@router.post("/ai")
async def create_dicts_by_ai_sse(
        request: List[DictionaryAiRequest],
):
    """
    여러 개의 번역 요청을 받아 SSE로 진행률과 결과를 스트리밍합니다.
    """
    async def event_generator():
        total_count = len(request)
        completed_count = 0

        # 1. 모든 AI 요청을 비동기 Task로 생성 (병렬 실행 시작)
        # 각 Task는 (request, result) 튜플을 반환하도록 래핑하여 어떤 키의 결과인지 알 수 있게 함
        tasks = []
        for req in request:
            task = asyncio.create_task(process_single_request(req))
            tasks.append(task)

        # 2. 먼저 완료되는 순서대로 처리 (as_completed)
        for future in asyncio.as_completed(tasks):
            try:
                result = await future

                # 진행률 계산 및 전송
                completed_count += 1
                progress_percent = int((completed_count / total_count) * 100)

                # A. 진행률 이벤트
                progress_response = StreamResponse(
                    data= {"percent": progress_percent},
                    status= EventStatus.PROGRESS
                )
                yield SSEFormatter.format(progress_response)

                # B. 결과 데이터 이벤트 (성공한 경우만)
                if result:
                    result_response = StreamResponse(
                        data= {"result": result},
                        status= EventStatus.RESULT
                    )
                    yield SSEFormatter.format(result_response)

            except Exception as e:
                # 개별 실패 시 전체가 죽지 않도록 에러 로그만 보내고 계속 진행
                error_response = StreamResponse(
                    data= None,
                    status= EventStatus.ERROR,
                    message = str(e)
                )
                yield SSEFormatter.format(error_response)

        # 3. 모든 처리가 끝나면 종료 이벤트 (선택사항)
        final_response = StreamResponse(
            data= None,
            status= EventStatus.DONE
        )
        yield SSEFormatter.format(final_response)

    return EventSourceResponse(event_generator())

# 개별 요청 및 에러처리
async def process_single_request(req):
    try:
        result = await dictionary_service.generate_translation_proposal(req)
        return result
    except Exception as e:
        print(f"Error processing {req.term_key}: {e}")
        return None