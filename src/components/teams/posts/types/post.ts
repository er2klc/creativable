
import { Tables } from "@/integrations/supabase/types";

export interface Post extends Tables<"team_posts"> {
  team_categories: {
    name: string;
    slug: string;
  };
  author: {
    display_name: string;
  };
  team_post_comments: {
    id: string;
  }[];
}
