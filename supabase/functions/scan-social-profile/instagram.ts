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

    // Use Instagram Graph API to get profile data
    const response = await fetch(`https://graph.instagram.com/v12.0/me?fields=id,username,account_type,media_count,followers_count,follows_count,biography&access_token=${authStatus.access_token}`);

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Instagram API response:', data);

    return {
      bio: data.biography,
      followers: data.followers_count,
      following: data.follows_count,
      posts: data.media_count,
      isPrivate: data.account_type === 'PRIVATE'
    };
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {};
  }
}