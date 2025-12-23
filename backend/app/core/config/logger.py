import logging
import sys
import structlog
from structlog.types import Processor

def setup_logging(json_logs: bool = False, log_level: str = "INFO"):
    timestamper = structlog.processors.TimeStamper(fmt="iso")

    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars, # ContextVars(request_id 등) 병합
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.stdlib.ExtraAdder(),
        timestamper,
        structlog.processors.StackInfoRenderer(),
    ]

    if json_logs:
        # 배포 환경 (JSON 포맷)
        processors = shared_processors + [
            structlog.processors.format_exc_info, # 예외 발생 시 스택트레이스 포맷팅
            structlog.processors.JSONRenderer(),
        ]
    else:
        # 개발 환경 (사람이 읽기 좋은 컬러 포맷)
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(),
        ]

    # structlog 설정
    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # 표준 라이브러리 logging과 연동 (Uvicorn 로그도 잡기 위해)
    logging.basicConfig(
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        stream=sys.stdout,
        level=logging.INFO,
        datefmt='%Y-%m-%d %H:%M:%S'
    )