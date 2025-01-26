import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function scanInstagramProfile(username: string, userId: string) {
  try {
    console.log('Starting Instagram profile scan for:', { username, userId });

    // Get Instagram access token from platform_auth_status
    const { data: authStatus, error: authError } = await supabase
      .from('platform_auth_status')
      .select('access_token')
      .eq('platform', 'instagram')
      .eq('user_id', userId)
      .eq('is_connected', true)
      .single();

    if (authError) {
      console.error('Error retrieving Instagram auth status:', authError);
      throw new Error('Failed to retrieve Instagram authentication status');
    }

    if (!authStatus?.access_token) {
      console.error('No Instagram access token found for user:', userId);
      throw new Error('No valid Instagram access token found. Please reconnect your Instagram account.');
    }

    console.log('Successfully retrieved Instagram access token');

    // First, we need to search for the user's Instagram Business Account ID
    const businessAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/ig_username/${username}?access_token=${authStatus.access_token}`
    );

    if (!businessAccountResponse.ok) {
      const errorText = await businessAccountResponse.text();
      console.error('Error getting Instagram business account:', errorText);
      throw new Error('Could not find Instagram business account');
    }

    const businessAccountData = await businessAccountResponse.json();
    const instagramBusinessAccountId = businessAccountData.id;

    // Now get the profile data using the business account ID
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}?fields=biography,followers_count,follows_count,media_count,username&access_token=${authStatus.access_token}`
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Error getting Instagram profile data:', errorText);
      throw new Error('Could not get Instagram profile data');
    }

    const data = await profileResponse.json();
    console.log('Successfully retrieved Instagram profile data:', data);

    return {
      bio: data.biography,
      followers: data.followers_count,
      following: data.follows_count,
      posts: data.media_count,
      isPrivate: false
    };
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    throw error;
  }
}