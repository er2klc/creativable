
import { Tables } from "@/integrations/supabase/types";

export interface Post extends Tables<"team_posts"> {
  team_categories: {
    name: string;
    slug: string;
    color: string;
  };
  author: {
    display_name: string | null;
    avatar_url?: string | null;
    email?: string | null;
  };
  team_post_comments: number;
  edited?: boolean;
  last_edited_at?: string;
}
