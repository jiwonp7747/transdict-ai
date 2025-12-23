import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

# 로거 인스턴스
access_logger = structlog.get_logger("api.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # 1. Request ID 생성 (또는 헤더에서 가져오기)
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # 2. ContextVars에 바인딩 (이후 모든 로그에 request_id가 자동 포함됨)
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        start_time = time.perf_counter()

        try:
            # 3. 요청 처리
            response = await call_next(request)
            process_time = time.perf_counter() - start_time

            # 4. 성공/일반 로그 (Access Log)
            access_logger.info(
                "http_request",
                http={
                    "path": request.url.path,
                    "method": request.method,
                    "status_code": response.status_code,
                    "user_agent": request.headers.get("user-agent"),
                },
                latency=f"{process_time:.4f}s"
            )

            # Response 헤더에도 ID 포함 (클라이언트 디버깅 용이)
            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as e:
            # 5. 예외 발생 시 에러 로그
            process_time = time.perf_counter() - start_time
            access_logger.error(
                "http_request_failed",
                http={
                    "path": request.url.path,
                    "method": request.method,
                },
                latency=f"{process_time:.4f}s",
                error=str(e),
                exc_info=True  # 스택트레이스 포함
            )
            raise e