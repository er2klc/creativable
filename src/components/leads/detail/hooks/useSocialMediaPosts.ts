import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPost, PostType } from "../types/lead";

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      console.log(`🚀 API wird für Lead ID: ${leadId} ausgeführt`);
      
      const { data: socialMediaPosts, error: postsError } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", leadId)
        .order("posted_at", { ascending: false });

      if (postsError) {
        console.error("⚠️ Fehler beim Abrufen der Social Media Posts:", postsError);
        throw postsError;
      }

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

        const taggedUsers = (matchingLeadPost?.taggedUsers || []).map((user: any) => {
          const { profile_pic_url, ...rest } = user;
          return rest;
        });

        return {
          ...post,
          media_urls: mediaUrls,
          video_url: videoUrl,
          platform: "Instagram",
          post_type: (post.post_type || "post") as PostType,
          type: post.post_type || "post",
          caption: post.content || null,
          likes_count: likesCount,
          comments_count: commentsCount,
          location: post.location || null,
          timestamp: post.posted_at || null,
          taggedUsers: taggedUsers,
          local_video_path: post.local_video_path || null,
          local_media_paths: post.local_media_paths || null,
        };
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};
