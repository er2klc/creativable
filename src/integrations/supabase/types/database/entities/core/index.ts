import { Json } from '../base/json';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  industry: string;
  email?: string | null;
  phone_number?: string | null;
  status?: string;
  pipeline_id: string;
  phase_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeadFile {
  id: string;
  lead_id?: string | null;
  user_id?: string | null;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  created_at?: string;
}

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