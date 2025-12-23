import os

from openai import AsyncOpenAI

aclient = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))