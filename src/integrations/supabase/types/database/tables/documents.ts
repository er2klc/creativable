export interface DocumentTables {
  documents: {
    Row: {
      created_at: string | null;
      file_path: string;
      file_type: string;
      filename: string;
      id: string;
      user_id: string;
    };
    Insert: {
      created_at?: string | null;
      file_path: string;
      file_type: string;
      filename: string;
      id?: string;
      user_id: string;
    };
    Update: {
      created_at?: string | null;
      file_path?: string;
      file_type?: string;
      filename?: string;
      id?: string;
      user_id?: string;
    };
  };
}