export interface ChatbotSetting {
  id: string;
  user_id: string;
  openai_api_key?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Keyword {
  id: string;
  user_id: string;
  keyword: string;
  created_at?: string | null;
}