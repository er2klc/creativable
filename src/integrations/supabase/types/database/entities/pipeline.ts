export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface PipelinePhase {
  id: string;
  pipeline_id: string;
  name: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}