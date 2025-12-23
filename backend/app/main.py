from contextlib import asynccontextmanager
from importlib.util import source_hash

import uvicorn
from fastapi import FastAPI

from app.common.exceptionhandler import register_exception_handler
from app.core.config import middleware_config
from app.core.config.logger import setup_logging
from app.db.database import AsyncSessionLocal, engine
from sqlalchemy import text

from app.middleware.logging import LoggingMiddleware
from app.router import router as api_router


# --- [Lifespan] 서버 시작/종료 시 실행될 로직 ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 서버 시작 프로세스 가동...")

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        print("✅ 데이터베이스 연결 성공")
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        # DB 연결 실패 시 서버를 켜지 않으려면 여기서 raise e

    print("✨ 서버 준비 완료")
    yield  # -------------------- [애플리케이션 가동 중] --------------------

    print("🛑 서버 종료 프로세스 가동...")
    await engine.dispose()
    print("👋 데이터베이스 연결 해제")

app = FastAPI(lifespan=lifespan)
app.include_router(api_router)

setup_logging()
middleware_config.set_cors_config(app)
app.add_middleware(LoggingMiddleware)
register_exception_handler(app)