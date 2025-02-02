import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPost } from "@/types/leads";

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      console.log(`🚀 API wird für Lead ID: ${leadId} ausgeführt`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      // ✅ Hole alle Social Media Posts aus `social_media_posts`
      const { data: socialMediaPosts, error: postsError } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", leadId)
        .eq("user_id", user.id)
        .order("posted_at", { ascending: false });

      if (postsError) {
        console.error("⚠️ Fehler beim Abrufen der Social Media Posts:", postsError);
        throw postsError;
      }

      // ✅ Hole `apify_instagram_data` aus `leads` (updated from social_media_posts)
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("apify_instagram_data")
        .eq("id", leadId)
        .single();

      if (leadError) {
        console.error("⚠️ Fehler beim Abrufen der Lead-Daten:", leadError);
        throw leadError;
      }

      console.log("🚀 DEBUG: API Antwort von Supabase (Social Media Posts):", socialMediaPosts);
      console.log("🚀 DEBUG: API Antwort von Supabase (Lead Data):", leadData);

      // ✅ Parse die `apify_instagram_data` aus der `leads`-Tabelle
      let leadSocialPosts = [];
      if (leadData?.apify_instagram_data) {
        try {
          leadSocialPosts = typeof leadData.apify_instagram_data === "string"
            ? JSON.parse(leadData.apify_instagram_data)
            : leadData.apify_instagram_data;
        } catch (e) {
          console.error("⚠️ Fehler beim Parsen von apify_instagram_data aus leads:", e);
        }
      }

      // ✅ Kombiniere beide Datenquellen (social_media_posts + leads)
      const mergedPosts = socialMediaPosts.map((post): SocialMediaPost => {
        const matchingLeadPost = leadSocialPosts.find((leadPost) => leadPost.id === post.id);

        let mediaUrls: string[] = [];
        if (post.media_urls) {
          mediaUrls = typeof post.media_urls === "string"
            ? JSON.parse(post.media_urls)
            : Array.isArray(post.media_urls)
              ? post.media_urls
              : [];
        }

        // ✅ Bevorzuge `videoUrl` aus `leads`, falls vorhanden
        const videoUrl = matchingLeadPost?.videoUrl || post.video_url || null;

        // ✅ Bevorzuge Likes & Kommentare aus `leads`, falls sie nicht 0 sind
        const likesCount = matchingLeadPost?.likesCount && matchingLeadPost.likesCount > 0 
          ? matchingLeadPost.likesCount 
          : post.likes_count || 0;

        const commentsCount = matchingLeadPost?.commentsCount && matchingLeadPost.commentsCount > 0 
          ? matchingLeadPost.commentsCount 
          : post.comments_count || 0;

        // ✅ Entferne `profile_pic_url` aus den `taggedUsers`
        const taggedUsers = (matchingLeadPost?.taggedUsers || []).map((user) => {
          const { profile_pic_url, ...rest } = user;
          return rest;
        });

        console.log(`🏷️ DEBUG: Tagged Users für Post ID ${post.id}:`, taggedUsers);

        return {
          ...post,
          media_urls: mediaUrls,
          video_url: videoUrl,
          platform: "Instagram",
          type: post.post_type || "post",
          post_type: (post.post_type || "post") as PostType,
          caption: post.content || null,
          likesCount: likesCount,
          commentsCount: commentsCount,
          location: post.location || null,
          mentioned_profiles: post.mentioned_profiles || null,
          tagged_profiles: post.tagged_profiles || null,
          timestamp: post.posted_at || null,
          taggedUsers: taggedUsers,
          local_video_path: post.local_video_path || null,
          local_media_paths: post.local_media_paths || null,
        };
      });

      // ✅ Füge fehlende `videoUrl`-Einträge aus `leads` als eigene Posts hinzu
      leadSocialPosts.forEach((leadPost) => {
        const existsInMerged = mergedPosts.some((p) => p.id === leadPost.id);
        if (!existsInMerged && leadPost.videoUrl) {
          console.log(`🎥 Füge fehlenden Video-Post aus leads hinzu: ${leadPost.id}`);

          mergedPosts.push({
            id: leadPost.id,
            user_id: user.id,
            lead_id: leadId,
            platform: "Instagram",
            type: "video",
            post_type: "video",
            content: leadPost.caption || null,
            caption: leadPost.caption || null,
            url: leadPost.url || null,
            posted_at: leadPost.timestamp || null,
            timestamp: leadPost.timestamp || null,
            media_urls: [],
            media_type: "video",
            video_url: leadPost.videoUrl,
            likesCount: leadPost.likesCount || null,
            commentsCount: leadPost.commentsCount || null,
          } as SocialMediaPost);
        }
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};