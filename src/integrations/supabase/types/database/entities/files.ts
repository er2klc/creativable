import { Json } from '../base/json';

export interface LeadFile {
  id: string;
  lead_id?: string | null;
  user_id?: string | null;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  compressed_file_path?: string | null;
  compressed_file_size?: number | null;
  preview_path?: string | null;
  created_at?: string | null;
  metadata?: Json | null;
}

export interface UserDocument {
  id: string;
  user_id: string;
  title: string;
  source_type: string;
  source_url?: string | null;
  file_path?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: Json | null;
}