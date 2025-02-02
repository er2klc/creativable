import { Json } from './json';

export interface LeadFile {
  id: string;
  lead_id: string | null;
  user_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  compressed_file_path: string | null;
  compressed_file_size: number | null;
  preview_path: string | null;
  created_at: string | null;
  metadata: Json | null;
}