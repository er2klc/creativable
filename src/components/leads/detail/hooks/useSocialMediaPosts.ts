import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SocialMediaPost } from "@/types/leads";

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      console.log(`🚀 API wird für Lead ID: ${leadId} ausgeführt`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
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

      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("apify_instagram_data")
        .eq("id", leadId)
        .single();

      if (leadError) {
        console.error("⚠️ Fehler beim Abrufen der Lead-Daten:", leadError);
        throw leadError;
      }

      let apifyPosts: any[] = [];
      if (leadData?.apify_instagram_data) {
        try {
          apifyPosts = Array.isArray(leadData.apify_instagram_data) 
            ? leadData.apify_instagram_data 
            : typeof leadData.apify_instagram_data === 'string'
              ? JSON.parse(leadData.apify_instagram_data)
              : [];
        } catch (e) {
          console.error("⚠️ Fehler beim Parsen von apify_instagram_data:", e);
        }
      }

      const mergedPosts = socialMediaPosts.map((post): SocialMediaPost => {
        const matchingApifyPost = apifyPosts.find((apifyPost) => apifyPost.id === post.id);

        let mediaUrls: string[] = [];
        if (post.media_urls) {
          mediaUrls = Array.isArray(post.media_urls) ? post.media_urls : [];
        }

        const videoUrl = matchingApifyPost?.videoUrl || post.video_url || null;
        const likesCount = matchingApifyPost?.likesCount && matchingApifyPost.likesCount > 0 
          ? matchingApifyPost.likesCount 
          : post.likes_count || 0;

        const commentsCount = matchingApifyPost?.commentsCount && matchingApifyPost.commentsCount > 0 
          ? matchingApifyPost.commentsCount 
          : post.comments_count || 0;

        return {
          ...post,
          media_urls: mediaUrls,
          video_url: videoUrl,
          platform: "Instagram",
          post_type: (post.post_type || "post") as PostType,
          caption: post.content || null,
          likes_count: likesCount,
          comments_count: commentsCount,
          location: post.location || null,
          timestamp: post.posted_at || null,
          tagged_users: post.tagged_users || [],
          user_id: user.id
        };
      });

      if (Array.isArray(apifyPosts)) {
        apifyPosts.forEach((apifyPost) => {
          const existsInMerged = mergedPosts.some((p) => p.id === apifyPost.id);
          if (!existsInMerged && apifyPost.videoUrl) {
            mergedPosts.push({
              id: apifyPost.id,
              user_id: user.id,
              lead_id: leadId,
              platform: "Instagram",
              post_type: "video" as PostType,
              content: apifyPost.caption || null,
              caption: apifyPost.caption || null,
              url: apifyPost.url || null,
              posted_at: apifyPost.timestamp || null,
              timestamp: apifyPost.timestamp || null,
              media_urls: [],
              media_type: "video",
              video_url: apifyPost.videoUrl,
              likes_count: apifyPost.likesCount || null,
              comments_count: apifyPost.commentsCount || null,
            });
          }
        });
      }

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};