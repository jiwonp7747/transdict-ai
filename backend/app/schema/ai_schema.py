from pydantic import BaseModel, Field

# AI가 뱉어낼 번역 결과의 구조
class MultiLanguageTranslation(BaseModel):
    ko: str = Field(description="Korean translation")
    en: str = Field(description="English translation")
    ch: str = Field(description="Chinese translation (Simplified)")
    ve: str = Field(description="Vietnamese translation")
    ja: str = Field(description="Japanese translation")