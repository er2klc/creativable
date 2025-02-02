export interface Team {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  created_by: string;
  max_members?: number;
  join_code?: string | null;
  logo_url?: string | null;
  order_index?: number;
  slug: string;
  video_url?: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
}