export interface TreeProfile {
  id: string;
  user_id: string;
  username: string;
  slug: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  bio?: string;
}

export interface TreeLink {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}