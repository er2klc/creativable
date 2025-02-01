import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPostRaw, PostType } from "../types/lead";

const saveTaggedUserAvatar = async (user: any) => {
  try {
    const response = await fetch(user.profile_pic_url);
    if (!response.ok) throw new Error("Failed to fetch image");

    const imageBuffer = await response.blob();
    const fileExt = "jpg";
    const fileName = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("tagged-user-avatars")
      .upload(fileName, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("⚠️ Error uploading tagged user avatar:", uploadError);
      return user;
    }

    const { data } = supabase.storage
      .from("tagged-user-avatars")
      .getPublicUrl(fileName);

    return {
      ...user,
      profile_pic_url: data?.publicUrl || user.profile_pic_url,
    };
  } catch (error) {
    console.error(`⚠️ Error processing user ${user.username}:`, error);
    return user;
  }
};

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      console.log(`🚀 API being executed for Lead ID: ${leadId}`);
      
      // ✅ Get all social media posts from `social_media_posts`
      const { data: socialMediaPosts, error: postsError } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", leadId)
        .order("posted_at", { ascending: false });

      if (postsError) {
        console.error("⚠️ Error fetching social media posts:", postsError);
        throw postsError;
      }

      // ✅ Get `social_media_posts` from `leads`
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("social_media_posts")
        .eq("id", leadId)
        .single();

      if (leadError) {
        console.error("⚠️ Error fetching lead data:", leadError);
        throw leadError;
      }

      console.log("🚀 DEBUG: Supabase API response (Social Media Posts):", socialMediaPosts);
      console.log("🚀 DEBUG: Supabase API response (Lead Data):", leadData);

      // ✅ Parse `social_media_posts` from `leads` table
      let leadSocialPosts = [];
      if (leadData?.social_media_posts) {
        try {
          leadSocialPosts = typeof leadData.social_media_posts === "string"
            ? JSON.parse(leadData.social_media_posts)
            : leadData.social_media_posts;
        } catch (e) {
          console.error("⚠️ Error parsing social_media_posts from leads:", e);
        }
      }

      // ✅ Combine both data sources (social_media_posts + leads)
      const mergedPosts = await Promise.all(socialMediaPosts.map(async (post): Promise<SocialMediaPostRaw> => {
        const matchingLeadPost = leadSocialPosts.find((leadPost) => leadPost.id === post.id);

        let mediaUrls: string[] = [];
        if (post.media_urls) {
          mediaUrls = typeof post.media_urls === "string"
            ? JSON.parse(post.media_urls)
            : Array.isArray(post.media_urls)
              ? post.media_urls
              : [];
        }

        // ✅ Prefer `videoUrl` from `leads` if available
        const videoUrl = matchingLeadPost?.videoUrl || post.video_url || null;

        // ✅ Prefer likes & comments from `leads` if they're not 0
        const likesCount = matchingLeadPost?.likesCount && matchingLeadPost.likesCount > 0 
          ? matchingLeadPost.likesCount 
          : post.likes_count || 0;

        const commentsCount = matchingLeadPost?.commentsCount && matchingLeadPost.commentsCount > 0 
          ? matchingLeadPost.commentsCount 
          : post.comments_count || 0;

        // ✅ Process tagged users and store their avatars
        let taggedUsers = matchingLeadPost?.taggedUsers || [];
        if (taggedUsers.length > 0) {
          taggedUsers = await Promise.all(
            taggedUsers.map(user => saveTaggedUserAvatar(user))
          );
        }

        console.log(`🏷️ DEBUG: Tagged Users for Post ID ${post.id}:`, taggedUsers);

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
      }));

      // ✅ Add missing `videoUrl` entries from `leads` as separate posts
      leadSocialPosts.forEach((leadPost) => {
        const existsInMerged = mergedPosts.some((p) => p.id === leadPost.id);
        if (!existsInMerged && leadPost.videoUrl) {
          console.log(`🎥 Adding missing video post from leads: ${leadPost.id}`);

          mergedPosts.push({
            id: leadPost.id,
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
          } as SocialMediaPostRaw);
        }
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};