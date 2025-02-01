import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { processMediaFiles } from './media-processor.ts';
import { InstagramPost, ProcessingState } from '../types/instagram.ts';

export async function processInstagramProfile(
  profileData: any,
  leadId: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<void> {
  console.log('Starting Instagram profile processing');

  try {
    // Extract basic profile info
    const {
      biography,
      followersCount,
      followingCount,
      fullName,
      postsCount,
      profilePicUrl,
      isVerified,
      posts
    } = profileData;

    // Calculate engagement rate
    const engagementRate = calculateEngagementRate(posts, followersCount);

    // Update lead with profile info
    await updateLeadProfile(
      supabaseClient,
      leadId,
      biography,
      followersCount,
      followingCount,
      postsCount,
      profilePicUrl,
      isVerified,
      engagementRate
    );

    // Process posts
    if (Array.isArray(posts)) {
      console.log(`Processing ${posts.length} posts`);
      
      for (const post of posts) {
        try {
          const postType = getPostType(post);
          const mediaUrls = getMediaUrls(post);
          const videoUrl = post.videoUrl || post.video_url;

          // For video posts, store in social_media_posts table
          if (postType === 'video' && videoUrl) {
            console.log('Processing video post:', { postId: post.id, videoUrl });
            
            await supabaseClient
              .from('social_media_posts')
              .upsert({
                id: post.id,
                lead_id: leadId,
                platform: 'Instagram',
                post_type: 'video',
                content: post.caption,
                likes_count: post.likesCount,
                comments_count: post.commentsCount,
                url: post.url,
                location: post.location,
                posted_at: post.timestamp,
                video_url: videoUrl, // Store original Instagram video URL
                hashtags: post.hashtags,
                media_type: 'video'
              });
          }
          // For image and sidecar posts
          else if (mediaUrls && mediaUrls.length > 0) {
            console.log('Processing image/sidecar post:', { postId: post.id, mediaCount: mediaUrls.length });
            
            await supabaseClient
              .from('social_media_posts')
              .upsert({
                id: post.id,
                lead_id: leadId,
                platform: 'Instagram',
                post_type: postType,
                content: post.caption,
                likes_count: post.likesCount,
                comments_count: post.commentsCount,
                url: post.url,
                location: post.location,
                posted_at: post.timestamp,
                media_urls: mediaUrls,
                hashtags: post.hashtags,
                media_type: postType
              });
          }
        } catch (postError) {
          console.error('Error processing post:', postError);
        }
      }
    }

    console.log('Finished processing Instagram profile');
  } catch (error) {
    console.error('Error in processInstagramProfile:', error);
    throw error;
  }
}

function calculateEngagementRate(posts: any[], followersCount: number): number {
  if (!Array.isArray(posts) || posts.length === 0 || !followersCount) return 0;

  const totalEngagement = posts.reduce((sum, post) => {
    const likes = post.likesCount || 0;
    const comments = post.commentsCount || 0;
    return sum + likes + comments;
  }, 0);

  const averageEngagement = totalEngagement / posts.length;
  return (averageEngagement / followersCount) * 100;
}

function getPostType(post: any): string {
  if (post.videoUrl || post.video_url) return 'video';
  if (post.mediaUrls && post.mediaUrls.length > 1) return 'sidecar';
  return 'image';
}

function getMediaUrls(post: any): string[] {
  if (post.mediaUrls && Array.isArray(post.mediaUrls)) {
    return post.mediaUrls;
  }
  if (post.imageUrl) {
    return [post.imageUrl];
  }
  return [];
}

async function updateLeadProfile(
  supabaseClient: ReturnType<typeof createClient>,
  leadId: string,
  biography: string,
  followersCount: number,
  followingCount: number,
  postsCount: number,
  profilePicUrl: string,
  isVerified: boolean,
  engagementRate: number
): Promise<void> {
  await supabaseClient
    .from('leads')
    .update({
      social_media_bio: biography,
      social_media_followers: followersCount,
      social_media_following: followingCount,
      social_media_posts_count: postsCount,
      social_media_profile_image_url: profilePicUrl,
      social_media_verified: isVerified,
      social_media_engagement_rate: engagementRate,
      last_social_media_scan: new Date().toISOString()
    })
    .eq('id', leadId);
}