import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPostRaw } from "../types/lead";

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      console.log(`🚀 API wird für Lead ID: ${leadId} ausgeführt`);
      
      // Abfrage für Posts aus "social_media_posts"
      const { data: socialMediaPosts, error: postsError } = await supabase
        .from("social_media_posts")
        .select("id, lead_id, post_type, media_urls, video_url, posted_at, content, likes_count, comments_count, url, media_type")
        .eq("lead_id", leadId)
        .order("posted_at", { ascending: false });

      if (postsError) {
        console.error("⚠️ Fehler beim Abrufen der Social Media Posts:", postsError);
        throw postsError;
      }

      // Abfrage für zusätzliche Daten aus "leads" (z. B. Video-URLs)
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("social_media_posts")
        .eq("id", leadId)
        .single();

      if (leadError) {
        console.error("⚠️ Fehler beim Abrufen der Lead-Daten:", leadError);
        throw leadError;
      }

      console.log("🚀 DEBUG: API Antwort von Supabase (Social Media Posts):", socialMediaPosts);
      console.log("🚀 DEBUG: API Antwort von Supabase (Lead Data):", leadData);

      // Extrahiere die Post-Daten aus den Lead-Daten (hauptsächlich für videoUrl)
      let leadSocialPosts = [];
      if (leadData?.social_media_posts) {
        try {
          leadSocialPosts = typeof leadData.social_media_posts === "string"
            ? JSON.parse(leadData.social_media_posts)
            : leadData.social_media_posts;
        } catch (e) {
          console.error("⚠️ Fehler beim Parsen von social_media_posts aus leads:", e);
        }
      }

      // Kombiniere die Daten
      const mergedPosts = socialMediaPosts.map((post): SocialMediaPostRaw => {
        const matchingLeadPost = leadSocialPosts.find((leadPost) => leadPost.id === post.id);
        let mediaUrls: string[] = [];
        if (post.media_urls) {
          mediaUrls = typeof post.media_urls === "string"
            ? JSON.parse(post.media_urls)
            : Array.isArray(post.media_urls)
              ? post.media_urls
              : [];
        }
        const videoUrl = post.video_url || matchingLeadPost?.videoUrl;

        return {
          ...post,
          media_urls: mediaUrls,
          video_url: videoUrl,
          platform: "Instagram", // Default platform
          post_type: (post.post_type || "post") as "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar"
        };
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};