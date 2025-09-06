import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useSocialMediaPosts = (leadId: string | undefined) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", leadId)
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("Error fetching social media posts:", error);
        throw error;
      }

      return data as Tables<"social_media_posts">[];
    },
    enabled: !!leadId,
  });
};