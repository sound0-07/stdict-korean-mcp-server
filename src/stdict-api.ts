/** 국립국어원 표준국어대사전 API */

import { appConfig } from "./config.js";
import { StdDictResponse, StdDictError } from "./types.js";

export class StdDictAPI {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = appConfig.stdict.baseUrl;
        this.apiKey = appConfig.stdict.apiKey;
    }

    /**
     * 단어를 검색합니다.
     * @param query 검색할 단어
     * @param start 시작 위치 (기본값: 1)
     * @param num 검색 결과 개수 (기본값: 10)
     */
    async searchWord(query: string, start: number = 1, num: number = 10): Promise<StdDictResponse> {
        const params = new URLSearchParams({
            key: this.apiKey,
            q: query,
            req_type: 'json',
            start: start.toString(),
            num: num.toString()
        });

        const response = await fetch(`${this.baseUrl}?${params.toString()}`);
        const data = await response.json();

        if ('error' in data) {
            const error = data as StdDictError;
            throw new Error(`API Error: ${error.error.message} (${error.error.error_code})`);
        }

        return data as StdDictResponse;
    }
}
