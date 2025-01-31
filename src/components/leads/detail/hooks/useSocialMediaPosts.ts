import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      console.log(`🚀 API wird für Lead ID: ${leadId} aufgerufen`);

      // ✅ Abfrage für Bilder & Metadaten aus "social_media_posts"
      const { data: socialMediaPosts, error: postsError } = await supabase
        .from("social_media_posts")
        .select("id, lead_id, post_type, media_urls, video_url, posted_at, content, likes_count, comments_count, url, media_type")
        .eq("lead_id", leadId)
        .order("posted_at", { ascending: false });

      if (postsError) {
        console.error("⚠️ Fehler beim Abrufen der Social Media Posts:", postsError);
        throw postsError;
      }

      // ✅ Abfrage für Video-URLs aus "leads" (social_media_posts Spalte)
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

      // ✅ Extrahiere die Video-URLs aus den Lead-Daten
      let leadSocialPosts = [];
      if (leadData?.social_media_posts) {
        try {
          leadSocialPosts = typeof leadData.social_media_posts === 'string' 
            ? JSON.parse(leadData.social_media_posts)
            : leadData.social_media_posts;
        } catch (e) {
          console.error("⚠️ Fehler beim Parsen von social_media_posts aus leads:", e);
        }
      }

      // ✅ Kombiniere die Daten
      const mergedPosts = socialMediaPosts.map(post => {
        const matchingLeadPost = leadSocialPosts.find(leadPost => leadPost.id === post.id);
        
        // Verarbeite media_urls
        let mediaUrls = [];
        if (post.media_urls) {
          mediaUrls = typeof post.media_urls === 'string' 
            ? JSON.parse(post.media_urls) 
            : Array.isArray(post.media_urls) 
              ? post.media_urls 
              : [];
        }

        // Bevorzuge video_url aus dem Post, Fallback auf videoUrl aus Lead-Daten
        const videoUrl = post.video_url || matchingLeadPost?.videoUrl;

        return {
          ...post,
          media_urls: mediaUrls,
          video_url: videoUrl
        };
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};