export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PipelinePhase {
  id: string;
  pipeline_id: string;
  name: string;
  order_index: number;
  created_at?: string | null;
  updated_at?: string | null;
}