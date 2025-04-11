/** 국립국어원 표준국어대사전 API */

import { appConfig } from "./config.js";
import { StdDictResponse, StdDictError } from "./types.js";

export class StdDictAPI {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = appConfig.stdict.baseUrl;
        this.apiKey = appConfig.stdict.apiKey;
        
        if (!this.apiKey) {
            throw new Error('STDICT_KOREAN_API_KEY 환경 변수가 설정되지 않았습니다.');
        }
    }

    /**
     * 단어를 검색합니다.
     * @param query 검색할 단어
     */
    async searchWord(query: string): Promise<StdDictResponse> {
        // 파라미터 유효성 검사
        if (!query) {
            throw new Error('검색어를 입력해주세요.');
        }

        const params = new URLSearchParams({
            key: this.apiKey,
            q: query,
            req_type: 'json',
        });

        const url = `${this.baseUrl}?${params.toString()}`;
        // console.log('요청 URL:', url);

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            // console.log('API 응답:', text);

            // 빈 응답 체크
            if (!text.trim()) {
                throw new Error('API가 빈 응답을 반환했습니다.');
            }

            try {
                // CDATA 섹션과 특수 문자가 포함된 URL 처리
                const processedText = text
                    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'");

                const data = JSON.parse(processedText);
                
                if ('error' in data) {
                    const error = data as StdDictError;
                    throw new Error(`API Error: ${error.error.message} (${error.error.error_code})`);
                }

                // 응답 구조 확인
                if (!data.channel) {
                    throw new Error('잘못된 API 응답 형식: channel 객체가 없습니다.');
                }

                return data as StdDictResponse;
            } catch (parseError) {
                // XML 응답일 수 있으므로 XML 에러 메시지 확인
                if (text.includes('<error>')) {
                    const errorCode = text.match(/<error_code>(\d+)<\/error_code>/)?.[1];
                    const errorMessage = text.match(/<message>([^<]+)<\/message>/)?.[1];
                    throw new Error(`API Error: ${errorMessage} (${errorCode})`);
                }
                
                throw new Error(`JSON 파싱 오류: ${parseError instanceof Error ? parseError.message : String(parseError)}\n응답 데이터: ${text}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`API 요청 실패: ${error.message}`);
            }
            throw error;
        }
    }
}
