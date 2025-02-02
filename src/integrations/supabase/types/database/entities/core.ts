import { Json } from '../base/json';

export interface Message {
  id: string;
  user_id: string;
  lead_id?: string;
  platform: string;
  content: string;
  sent_at?: string;
  read: boolean;
}

export interface UserDocument {
  id: string;
  user_id: string;
  title: string;
  source_type: string;
  source_url?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Json;
}

export interface Task {
  id: string;
  user_id: string;
  lead_id?: string;
  title: string;
  completed?: boolean;
  due_date?: string;
  created_at?: string;
  color?: string;
  meeting_type?: string;
  cancelled?: boolean;
  priority?: string;
  order_index?: number;
  updated_at?: string;
}

export interface Note {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Json;
}

export interface LeadFile {
  id: string;
  lead_id?: string;
  user_id?: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  industry: string;
  email?: string;
  phone_number?: string;
  status?: string;
  pipeline_id: string;
  phase_id: string;
  created_at?: string;
  updated_at?: string;
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