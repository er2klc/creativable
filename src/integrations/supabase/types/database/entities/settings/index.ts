import { Json } from '../base/json';

export interface Setting {
  id: string;
  user_id: string;
  language?: string;
  openai_api_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatbotSetting {
  id: string;
  user_id: string;
  openai_api_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Keyword {
  id: string;
  user_id: string;
  keyword: string;
  created_at?: string;
}