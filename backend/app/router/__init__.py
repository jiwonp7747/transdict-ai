from fastapi import APIRouter
from app.router.context_router import router as context_router
from app.router.dictionary_router import router as dictionary_router
from app.router.sse_router import router as sse_router
from app.router.json_template_router import router as json_template_router

router = APIRouter()
router.include_router(context_router)
router.include_router(dictionary_router)
router.include_router(sse_router)
router.include_router(json_template_router)

__all__ = [
    "router",
]
