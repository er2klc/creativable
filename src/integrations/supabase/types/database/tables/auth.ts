import { Json } from '../base/json';

export interface AuthTables {
  chatbot_settings: {
    Row: {
      id: string;
      user_id: string;
      openai_api_key: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      user_id: string;
      openai_api_key?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      user_id?: string;
      openai_api_key?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
}