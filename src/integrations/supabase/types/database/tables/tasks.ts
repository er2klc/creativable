export interface TaskTables {
  tasks: {
    Row: {
      completed: boolean | null;
      created_at: string | null;
      due_date: string | null;
      id: string;
      lead_id: string | null;
      title: string;
      user_id: string;
    };
    Insert: {
      completed?: boolean | null;
      created_at?: string | null;
      due_date?: string | null;
      id?: string;
      lead_id?: string | null;
      title: string;
      user_id: string;
    };
    Update: {
      completed?: boolean | null;
      created_at?: string | null;
      due_date?: string | null;
      id?: string;
      lead_id?: string | null;
      title?: string;
      user_id?: string;
    };
  };
}