import { SocialMediaPost } from "@/types/leads";
import { RawSocialMediaPost, ApifyPost } from "./types";

export const transformApifyPost = (
  apifyPost: ApifyPost,
  userId: string,
  leadId: string
): Partial<SocialMediaPost> => {
  if (!apifyPost.videoUrl) return {};

  return {
    id: apifyPost.id,
    user_id: userId,
    lead_id: leadId,
    platform: "Instagram",
    post_type: "video",
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
  };
};

export const transformSocialMediaPost = (
  post: RawSocialMediaPost,
  apifyPosts: ApifyPost[]
): SocialMediaPost => {
  const matchingApifyPost = apifyPosts.find((apifyPost) => apifyPost.id === post.id);

  const mediaUrls = post.media_urls ? 
    (Array.isArray(post.media_urls) ? post.media_urls : []) : 
    [];

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
    post_type: (post.post_type || "post"),
    caption: post.content || null,
    likes_count: likesCount,
    comments_count: commentsCount,
    location: post.location || null,
    timestamp: post.posted_at || null,
    tagged_users: post.tagged_users || [],
  };
};