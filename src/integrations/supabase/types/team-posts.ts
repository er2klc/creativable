export interface TeamPost {
  id: string;
  team_id: string;
  category_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  pinned: boolean | null;
  file_urls: string[] | null;
}

export interface TeamPostComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string;
}