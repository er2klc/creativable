import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { InstagramProfile } from '../types/instagram.ts';

export async function processInstagramProfile(
  profile: InstagramProfile,
  leadId: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<void> {
  console.log('Processing profile data:', { leadId, username: profile.username });

  // Calculate engagement metrics
  const allHashtags = new Set<string>();
  profile.latestPosts?.forEach((post) => {
    post.hashtags?.forEach((tag) => allHashtags.add(tag));
  });

  const engagementRate = profile.followersCount ? 
    ((profile.latestPosts?.reduce((sum, post) => 
      sum + (parseInt(post.likesCount as string) || 0) + (parseInt(post.commentsCount as string) || 0), 0) / 
      (profile.latestPosts?.length || 1)) / parseInt(profile.followersCount as string))
    : 0;

  // Download and process profile image
  let newProfileImageUrl = null;
  if (profile.profilePicUrlHD || profile.profilePicUrl) {
    try {
      const response = await fetch(profile.profilePicUrlHD || profile.profilePicUrl);
      if (!response.ok) throw new Error('Failed to fetch profile image');
      
      const imageBuffer = await response.arrayBuffer();
      const fileExt = 'jpg';
      const fileName = `${leadId}-profile.${fileExt}`;

      const { error: uploadError } = await supabaseClient
        .storage
        .from('contact-avatars')
        .upload(fileName, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading profile image:', uploadError);
      } else {
        const { data: { publicUrl } } = supabaseClient
          .storage
          .from('contact-avatars')
          .getPublicUrl(fileName);
        
        newProfileImageUrl = publicUrl;
      }
    } catch (error) {
      console.error('Error processing profile image:', error);
    }
  }

  // Update lead with profile data
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

  // Log completion
  console.log('Profile processing completed successfully:', { leadId, username: profile.username });
}