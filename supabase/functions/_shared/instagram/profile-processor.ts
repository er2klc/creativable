import { createClient } from '@supabase/supabase-js';
import { InstagramProfile, ProcessingState } from '../types/instagram';
import { downloadAndUploadImage } from './media-processor';

export async function processInstagramProfile(
  profile: InstagramProfile,
  leadId: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<void> {
  console.log('Processing profile data:', profile);

  const allHashtags = new Set<string>();
  profile.latestPosts?.forEach((post) => {
    post.hashtags?.forEach((tag) => allHashtags.add(tag));
  });

  const engagementRate = profile.followersCount ? 
    ((profile.latestPosts?.reduce((sum, post) => 
      sum + (parseInt(post.likesCount as string) || 0) + (parseInt(post.commentsCount as string) || 0), 0) / 
      (profile.latestPosts?.length || 1)) / parseInt(profile.followersCount as string))
    : 0;

  const newProfileImageUrl = await downloadAndUploadImage(
    profile.profilePicUrlHD || profile.profilePicUrl,
    supabaseClient,
    leadId
  );

  await supabaseClient
    .from('leads')
    .update({
      name: profile.fullName || profile.username,
      social_media_bio: profile.biography,
      social_media_followers: parseInt(profile.followersCount as string) || 0,
      social_media_following: parseInt(profile.followsCount as string) || 0,
      social_media_engagement_rate: engagementRate,
      social_media_profile_image_url: newProfileImageUrl,
      social_media_posts: profile.latestPosts,
      social_media_verified: profile.verified,
      social_media_categories: profile.businessCategoryName ? [profile.businessCategoryName] : null,
      social_media_interests: Array.from(allHashtags),
      last_social_media_scan: new Date().toISOString()
    })
    .eq('id', leadId);
}