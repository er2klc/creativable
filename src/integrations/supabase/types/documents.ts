export interface UserDocument {
  id: string;
  user_id: string;
  title: string;
  source_type: string;
  source_url?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  tokens: number;
  created_at?: string;
}