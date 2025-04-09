
export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  team_id: string;
  category_id?: string;
  slug: string;
  pinned?: boolean;
  team_post_comments: number;
  file_urls?: string[];
  edited?: boolean;
  last_edited_at?: string;
  team_categories?: {
    name: string;
    slug: string;
    color: string;
    settings?: {
      size?: "small" | "medium" | "large";
    };
  };
  author?: {
    display_name?: string;
    avatar_url?: string;
    email?: string;
  };
}
