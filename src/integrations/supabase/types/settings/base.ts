export interface BaseSettings {
  id: string;
  user_id: string;
  language: string | null;
  default_message_template: string | null;
  last_selected_pipeline_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}