import { Json } from '../base/json';

export interface Team {
  id: string;
  name: string;
  created_at?: string;
  created_by: string;
  max_members?: number;
  description?: string;
  join_code?: string;
  logo_url?: string;
  order_index?: number;
  slug: string;
  video_url?: string;
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
  created_at?: string;
  updated_at?: string;
  created_by: string;
  pinned?: boolean;
  file_urls?: string[];
}

export interface TeamEvent {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  created_by?: string;
  created_at?: string;
  color?: string;
}

export interface TeamPostComment {
  id: string;
  post_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  created_by: string;
}