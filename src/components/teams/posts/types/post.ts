export interface Post {
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
  team_categories?: {
    name: string;
    slug?: string;
    color: string;
    settings?: { size: string };
    team_category_settings?: { size: string }[];
  } | null;
  author?: any;
  team_post_comments: any;
  slug?: string;
}