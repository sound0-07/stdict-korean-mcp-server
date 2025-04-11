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
    total: number;
    num: number;
    title: string;
    start: number;
    description: string;
    item: StdDictItem[];
    link: string;
    lastBuildDate: string;
  };
}

export interface StdDictItem {
  sup_no: string;
  word: string;
  target_code: string;
  sense: StdDictSense;
  pos: string;
}

export interface StdDictSense {
  definition: string;
  link: string;
  type: string;
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