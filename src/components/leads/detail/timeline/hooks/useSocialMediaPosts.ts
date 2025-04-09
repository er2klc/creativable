
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SocialMediaPost {
  id: string;
  platform: string;
  post_url: string;
  post_content: string;
  post_type: string;
  post_date: string;
  likes: number;
  comments: number;
  lead_id: string;
  created_at: string;
  metadata?: any;
  location?: string;
}

export function useSocialMediaPosts(leadId?: string) {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async (): Promise<SocialMediaPost[]> => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", leadId)
        .order("post_date", { ascending: false });

      if (error) {
        console.error("Error fetching social media posts:", error);
        throw new Error("Failed to fetch social media posts");
      }

      return data || [];
    },
    enabled: !!leadId
  });
}

export default useSocialMediaPosts;
