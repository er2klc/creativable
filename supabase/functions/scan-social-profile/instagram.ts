import { SocialMediaStats } from "../_shared/social-media-utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export async function scanInstagramProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning Instagram profile for:', username);
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Instagram access token from platform_auth_status
    const { data: authStatus, error: authError } = await supabase
      .from('platform_auth_status')
      .select('access_token')
      .eq('platform', 'instagram')
      .single();

    if (authError || !authStatus?.access_token) {
      throw new Error('No valid Instagram access token found');
    }

    // First, we need to search for the user's Instagram Business Account ID
    const businessAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/ig_username/${username}?access_token=${authStatus.access_token}`
    );

    if (!businessAccountResponse.ok) {
      console.error('Error getting Instagram business account:', await businessAccountResponse.text());
      throw new Error('Could not find Instagram business account');
    }

    const businessAccountData = await businessAccountResponse.json();
    const instagramBusinessAccountId = businessAccountData.id;

    // Now get the profile data using the business account ID
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}?fields=biography,followers_count,follows_count,media_count,username&access_token=${authStatus.access_token}`
    );

    if (!profileResponse.ok) {
      console.error('Error getting Instagram profile data:', await profileResponse.text());
      throw new Error('Could not get Instagram profile data');
    }

    const data = await profileResponse.json();
    console.log('Instagram API response:', data);

    return {
      bio: data.biography,
      followers: data.followers_count,
      following: data.follows_count,
      posts: data.media_count,
      isPrivate: false // Instagram Business accounts are always public
    };
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {};
  }
}