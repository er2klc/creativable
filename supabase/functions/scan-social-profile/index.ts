import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, username } = await req.json();
    
    if (platform === 'instagram') {
      console.log('Starting Instagram profile scan for:', username);
      
      // Clean the username (remove @ if present and any trailing/leading spaces)
      const cleanUsername = username.replace('@', '').trim();
      const profileUrl = `https://www.instagram.com/${cleanUsername}/?__a=1`;

      console.log('Fetching data from:', profileUrl);
      
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.error('Error fetching Instagram profile:', response.status);
        throw new Error(`Failed to fetch Instagram profile: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Instagram API response:', data);

      // Extract relevant data from the response
      const profileData = {
        username: cleanUsername,
        bio: data?.graphql?.user?.biography || null,
        followers: data?.graphql?.user?.edge_followed_by?.count || null,
        following: data?.graphql?.user?.edge_follow?.count || null,
        posts: data?.graphql?.user?.edge_owner_to_timeline_media?.count || null,
        isPrivate: data?.graphql?.user?.is_private || false,
        engagement_rate: null, // Calculate if needed based on available data
      };

      return new Response(JSON.stringify(profileData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Unsupported platform');
  } catch (error) {
    console.error('Error scanning profile:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        username: null,
        bio: null,
        followers: null,
        following: null,
        posts: null,
        isPrivate: null,
        engagement_rate: null
      }),
      { 
        status: 200, // Keep 200 to handle errors gracefully in the frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});