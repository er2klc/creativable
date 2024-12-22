import { Json } from './auth';

export interface Settings {
  id: string;
  user_id: string;
  language: string | null;
  openai_api_key: string | null;
  superchat_api_key: string | null;
  default_message_template: string | null;
  company_name: string | null;
  products_services: string | null;
  target_audience: string | null;
  usp: string | null;
  business_description: string | null;
  about_me: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SettingsInsert extends Partial<Settings> {
  user_id: string;
}

export interface SettingsUpdate extends Partial<Settings> {}