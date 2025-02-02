export interface Setting {
  id: string;
  user_id: string;
  openai_api_key?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Keyword {
  id: string;
  user_id: string;
  keyword: string;
  created_at?: string;
}