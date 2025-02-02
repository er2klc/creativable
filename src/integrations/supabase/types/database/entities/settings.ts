export interface Setting {
  id: string;
  user_id: string;
  openai_api_key?: string | null;
  language?: string;
  created_at?: string;
  updated_at?: string;
}