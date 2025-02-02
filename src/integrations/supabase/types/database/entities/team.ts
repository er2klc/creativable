export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  created_by: string;
  max_members?: number;
  join_code?: string;
  logo_url?: string;
  order_index?: number;
  slug: string;
  video_url?: string;
}