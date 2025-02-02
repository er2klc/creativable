export interface Setting {
  id: string;
  user_id: string;
  openai_api_key?: string | null;
  language?: string;
  created_at?: string;
  updated_at?: string;
  company_name?: string | null;
  products_services?: string | null;
  target_audience?: string | null;
  usp?: string | null;
  business_description?: string | null;
  last_selected_pipeline_id?: string | null;
}