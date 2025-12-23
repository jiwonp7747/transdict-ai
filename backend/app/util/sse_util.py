from typing import Union
from pydantic import BaseModel


class SSEFormatter:
    """SSE(Server-Sent Events) 포맷 유틸리티 클래스"""

    @staticmethod
    def format(data: Union[BaseModel, dict, str]) -> str:
        """
        데이터를 SSE 포맷으로 변환

        Args:
            data: Pydantic 모델, dict, 또는 JSON 문자열

        Returns:
            SSE 포맷 문자열 (data: {json}\n\n)
        """
        if isinstance(data, BaseModel):
            json_str = data.model_dump_json()
        elif isinstance(data, dict):
            import json
            json_str = json.dumps(data, ensure_ascii=False)
        else:
            json_str = data

        return f"{json_str}\n\n"

    @staticmethod
    def format_event(event: str, data: Union[BaseModel, dict, str]) -> str:
        """
        이벤트 타입을 포함한 SSE 포맷으로 변환

        Args:
            event: 이벤트 타입 (예: 'message', 'error', 'done')
            data: Pydantic 모델, dict, 또는 JSON 문자열

        Returns:
            SSE 포맷 문자열 (event: {event}\ndata: {json}\n\n)
        """
        if isinstance(data, BaseModel):
            json_str = data.model_dump_json()
        elif isinstance(data, dict):
            import json
            json_str = json.dumps(data, ensure_ascii=False)
        else:
            json_str = data

        return f"event: {event}\ndata: {json_str}\n\n"

    @staticmethod
    def format_comment(comment: str) -> str:
        """
        SSE 주석 포맷으로 변환 (keep-alive 용도)

        Args:
            comment: 주석 내용

        Returns:
            SSE 주석 포맷 (: {comment}\n\n)
        """
        return f": {comment}\n\n"