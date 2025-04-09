
export interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  created_at?: string;
  created_by?: string;
  join_code?: string;
  members?: number;
  max_members?: number;
}
