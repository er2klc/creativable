export interface TreeLink {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  order_index?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TreeProfile {
  id: string;
  user_id: string;
  username: string;
  slug: string;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  bio?: string | null;
}