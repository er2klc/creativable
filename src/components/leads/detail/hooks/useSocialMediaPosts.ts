import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPost, PostType } from "@/types/leads";

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

      let leadSocialPosts = [];
      if (leadData?.apify_instagram_data) {
        try {
          leadSocialPosts = typeof leadData.apify_instagram_data === "string"
            ? JSON.parse(leadData.apify_instagram_data)
            : leadData.apify_instagram_data;
        } catch (e) {
          console.error("⚠️ Fehler beim Parsen von apify_instagram_data:", e);
        }
      }

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

        const videoUrl = matchingLeadPost?.videoUrl || post.video_url || null;
        const likesCount = matchingLeadPost?.likesCount && matchingLeadPost.likesCount > 0 
          ? matchingLeadPost.likesCount 
          : post.likes_count || 0;

        const commentsCount = matchingLeadPost?.commentsCount && matchingLeadPost.commentsCount > 0 
          ? matchingLeadPost.commentsCount 
          : post.comments_count || 0;

        return {
          ...post,
          media_urls: mediaUrls,
          video_url: videoUrl,
          platform: "Instagram",
          post_type: post.post_type as PostType || "post",
          caption: post.content || null,
          likes_count: likesCount,
          comments_count: commentsCount,
          location: post.location || null,
          mentioned_profiles: post.mentioned_profiles || null,
          tagged_profiles: post.tagged_profiles || null,
          posted_at: post.posted_at || null,
          timestamp: post.posted_at || null,
          tagged_users: post.tagged_users || [],
          local_video_path: post.local_video_path || null,
          local_media_paths: post.local_media_paths || null,
        };
      });

      leadSocialPosts.forEach((leadPost) => {
        const existsInMerged = mergedPosts.some((p) => p.id === leadPost.id);
        if (!existsInMerged && leadPost.videoUrl) {
          mergedPosts.push({
            id: leadPost.id,
            user_id: user.id,
            lead_id: leadId,
            platform: "Instagram",
            post_type: "video" as PostType,
            content: leadPost.caption || null,
            caption: leadPost.caption || null,
            url: leadPost.url || null,
            posted_at: leadPost.timestamp || null,
            timestamp: leadPost.timestamp || null,
            media_urls: [],
            media_type: "video",
            video_url: leadPost.videoUrl,
            likes_count: leadPost.likesCount || null,
            comments_count: leadPost.commentsCount || null,
          } as SocialMediaPost);
        }
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};