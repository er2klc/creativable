import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_posts")
        .select("id, lead_id, post_type, media_urls, video_url, posted_at, content, likes_count, comments_count, url, media_type")
        .eq("lead_id", leadId)
        .order("posted_at", { ascending: false });

      if (error) throw error;

      // 🔹 Falls media_urls ein JSON-String ist, konvertieren
      return data.map(post => ({
        ...post,
        media_urls: typeof post.media_urls === "string" ? JSON.parse(post.media_urls) : post.media_urls
      }));
    },
  });
};
