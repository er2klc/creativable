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
      
      // Use Instagram's public GraphQL API
      const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
      
      console.log('Fetching data from:', url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'X-IG-App-ID': '936619743392459'
        }
      });

      if (!response.ok) {
        console.error('Error fetching Instagram profile:', response.status);
        throw new Error(`Failed to fetch Instagram profile: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Instagram API response:', data);

      const user = data?.data?.user;
      if (!user) {
        throw new Error('No user data found');
      }

      // Extract relevant data from the response
      const profileData = {
        username: cleanUsername,
        bio: user.biography || null,
        followers: user.edge_followed_by?.count || null,
        following: user.edge_follow?.count || null,
        posts: user.edge_owner_to_timeline_media?.count || null,
        isPrivate: user.is_private || false,
        engagement_rate: null // Calculate if needed based on available data
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