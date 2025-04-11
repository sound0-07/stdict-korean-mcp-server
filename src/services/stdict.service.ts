import axios from 'axios';
import type { StdictSearchParams, StdictSearchResponse, StdictError } from '../types/stdict.js';

export class StdictService {
  private readonly baseUrl = 'https://stdict.korean.go.kr/api/search.do';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 국립국어원 표준국어대사전 API를 사용하여 단어를 검색합니다.
   * @param query 검색할 단어
   * @param options 검색 옵션
   * @returns 검색 결과
   */
  async searchWord(query: string, options: Partial<StdictSearchParams> = {}): Promise<StdictSearchResponse> {
    try {
      // API 요청 파라미터 구성
      const params: StdictSearchParams = {
        key: this.apiKey,
        q: query,
        req_type: 'json',
        ...options
      };

      // API 요청 전송
      const response = await axios.get<StdictSearchResponse>(this.baseUrl, { params });
      
      // 응답 결과 반환
      return response.data;
    } catch (error) {
      // API 에러 처리
      if (axios.isAxiosError(error) && error.response?.data) {
        const stdictError = error.response.data as StdictError;
        throw new Error(`Stdict API Error: ${stdictError.error.message} (${stdictError.error.error_code})`);
      }
      
      // 기타 에러 처리
      if (error instanceof Error) {
        throw new Error(`Stdict API 요청 중 오류 발생: ${error.message}`);
      }
      
      // 알 수 없는 에러
      throw new Error('Stdict API 요청 중 알 수 없는 오류가 발생했습니다.');
    }
  }
} 