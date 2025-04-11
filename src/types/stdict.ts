export type SearchMethod = 'exact' | 'include' | 'start' | 'end';

export interface StdictSearchParams {
  key: string;
  q: string;
  req_type?: 'json' | 'xml';
  start?: number;
  num?: number;
  advanced?: 'y' | 'n';
  method?: SearchMethod;
  target_code?: string;
}

export interface StdictSearchResponse {
  channel: {
    title: string;
    link: string;
    description: string;
    lastBuildDate: string;
    total: number;
    start: number;
    num: number;
    item: StdictItem[] | StdictItem;
  };
}

export interface StdictItem {
  target_code: number;
  word: string;
  sup_no?: number;
  pos?: string;
  sense: {
    definition: string;
    link: string;
    type: string;
  };
}

export interface StdictError {
  error: {
    error_code: string;
    message: string;
  };
} 