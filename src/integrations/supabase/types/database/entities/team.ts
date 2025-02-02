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

export interface TeamPost {
  id: string;
  team_id: string;
  category_id: string;
  title: string;
  content: string;
  created_at?: string | null;
  created_by: string;
  pinned?: boolean | null;
  file_urls?: string[] | null;
}

export interface TeamPostComment {
  id: string;
  post_id: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  created_by: string;
}

export interface TeamEvent {
  id: string;
  team_id?: string | null;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  color?: string | null;
}