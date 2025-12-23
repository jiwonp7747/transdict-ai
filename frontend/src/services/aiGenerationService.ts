import config from "../config";

/**
 * AI Generation Request Item
 */
export interface AIGenerationRequestItem {
    context_id: number;
    term_key: string;
    content: string;
    language: string;
    description: string;
}

/**
 * SSE Event Data Types
 */
export interface SSEProgressData {
    status: 'progress';
    data: {
        percent: number;
    };
}

export interface SSEResultData {
    status: 'result';
    data: {
        result: {
            term_key: string;
            ko: string;
            en: string;
            ch: string;
            ve: string;
            ja: string;
        };
    };
}

export interface SSEDoneData {
    status: 'done';
}

export interface SSEErrorData {
    status: 'error';
    message: string;
}

export type SSEEventData = SSEProgressData | SSEResultData | SSEDoneData | SSEErrorData;

/**
 * SSE Event Handler Type
 */
export type SSEEventHandler = (event: SSEEventData) => void;

/**
 * API Service for AI Generation
 */
class AiGenerationService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.apiUrl;
    }

    /**
     * AI Generation SSE 요청
     * @param requestBody - 생성 요청 항목 배열
     * @param onEvent - SSE 이벤트 핸들러
     */
    async generateWithSSE(
        requestBody: AIGenerationRequestItem[],
        onEvent: SSEEventHandler
    ): Promise<void> {
        console.log('=== AI Generation Request ===');
        console.log('Request URL:', `${this.baseUrl}/sse/ai`);
        console.log('Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${this.baseUrl}/sse/ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        let buffer = '';

        // SSE 스트림 읽기
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                console.log('SSE stream finished');
                break;
            }

            // 버퍼에 새로운 데이터 추가
            buffer += decoder.decode(value, { stream: true });

            // 줄 단위로 분리
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 마지막 불완전한 줄은 버퍼에 유지

            // 각 줄 처리
            for (const line of lines) {
                // SSE 형식: "data: {...}"
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr) as SSEEventData;
                        onEvent(data);

                        // done 이벤트면 종료
                        if (data.status === 'done') {
                            return;
                        }

                        // error 이벤트면 예외 발생
                        if (data.status === 'error') {
                            throw new Error(data.message || 'Generation failed');
                        }
                    } catch (parseError) {
                        console.error('Failed to parse SSE message:', parseError, line);
                        throw parseError;
                    }
                }
            }
        }
    }
}

export const aiGenerationService = new AiGenerationService();
export default aiGenerationService;
