export interface PipelineTables {
  pipeline_phases: {
    Row: {
      id: string;
      pipeline_id: string;
      name: string;
      order_index: number;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      pipeline_id: string;
      name: string;
      order_index?: number;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      pipeline_id?: string;
      name?: string;
      order_index?: number;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
}