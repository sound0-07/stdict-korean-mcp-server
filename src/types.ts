// 설정 파일 타입
export interface AppConfig {
  stdict: {
    apiKey: string;
    baseUrl: string;
  };
}

// 표준국어대사전 API 응답 타입
export interface StdDictResponse {
  channel: {
    title: string;
    link: string;
    description: string;
    lastBuildDate: string;
    total: number;
    start: number;
    num: number;
    item?: StdDictItem[];
  };
}

export interface StdDictItem {
  target_code: number;
  word: string;
  sup_no?: number;
  pos: string;
  sense: {
    definition: string;
    link: string;
    type: string;
  };
}

export interface StdDictError {
  error: {
    error_code: string;
    message: string;
  };
}

// MCP 서버 타입
export interface RequestHandlerExtra {
  parameters: Record<string, unknown>;
}

export interface ResponseContent {
  type: 'text';
  text: string;
}

export interface ToolResponse {
  content: ResponseContent[];
  isError?: boolean;
} 