import { Json } from './json';

export interface Note {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: Json | null;
}