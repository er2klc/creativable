import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPostRaw, PostType } from "../types/lead";

const saveTaggedUserAvatar = async (user: any) => {
  try {
    // Use no-cors mode for the initial fetch
    const response = await fetch(user.profile_pic_url, {
      mode: 'no-cors',
      credentials: 'omit',
      headers: {
        'Accept': 'image/jpeg'
      }
    });

    // If we can't get the image directly, use a default avatar
    if (!response.ok) {
      console.warn(`⚠️ Could not fetch avatar for ${user.username}, using default`);
      return user;
    }

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
      
      const { data: socialMediaPosts, error: postsError } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", leadId)
        .order("posted_at", { ascending: false });

      if (postsError) {
        console.error("⚠️ Error fetching social media posts:", postsError);
        throw postsError;
      }

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

        const videoUrl = matchingLeadPost?.videoUrl || post.video_url || null;

        const likesCount = matchingLeadPost?.likesCount && matchingLeadPost.likesCount > 0 
          ? matchingLeadPost.likesCount 
          : post.likes_count || 0;

        const commentsCount = matchingLeadPost?.commentsCount && matchingLeadPost.commentsCount > 0 
          ? matchingLeadPost.commentsCount 
          : post.comments_count || 0;

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

      // Add missing video URL entries from leads as separate posts
      leadSocialPosts.forEach((leadPost) => {
        const existsInMerged = mergedPosts.some((p) => p.id === leadPost.id);
        if (!existsInMerged && leadPost.videoUrl) {
          console.log(`🎥 Adding missing video post from leads: ${leadPost.id}`);

          mergedPosts.push({
            id: leadPost.id,
            lead_id: leadId,
            platform: "Instagram",
            type: "video",
            post_type: "video" as PostType,
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
            location: null,
            mentioned_profiles: null,
            tagged_profiles: null,
            local_video_path: null,
            local_media_paths: null,
            taggedUsers: leadPost.taggedUsers || [],
          });
        }
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};