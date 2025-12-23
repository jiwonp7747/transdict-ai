from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

def set_cors_config(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )