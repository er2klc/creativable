
import { Tables } from "@/integrations/supabase/types";

export interface Post extends Tables<"team_posts"> {
  team_categories: {
    name: string;
    slug: string;
    color: string;  // Hinzugefügt
  };
  author: {
    display_name: string;
    avatar_url?: string | null;
  };
  team_post_comments: {
    id: string;
  }[];
  edited?: boolean;
  last_edited_at?: string;
}
