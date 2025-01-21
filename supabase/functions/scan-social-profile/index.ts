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
      const url = `https://www.instagram.com/${cleanUsername}/`;
      
      console.log('Fetching data from:', url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html',
        }
      });

      if (!response.ok) {
        console.error('Error fetching Instagram profile:', response.status);
        throw new Error(`Failed to fetch Instagram profile: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Extract meta data from HTML
      const getMetaContent = (name: string) => {
        const match = html.match(new RegExp(`<meta property="${name}" content="([^"]*)"`, 'i'));
        return match ? match[1] : null;
      };

      // Extract follower count from text
      const getFollowerCount = () => {
        const match = html.match(/(\d+(?:[,.]\d+)*)\s*Followers/i);
        return match ? parseInt(match[1].replace(/[,.]/g, '')) : null;
      };

      // Extract following count
      const getFollowingCount = () => {
        const match = html.match(/(\d+(?:[,.]\d+)*)\s*Following/i);
        return match ? parseInt(match[1].replace(/[,.]/g, '')) : null;
      };

      // Extract posts count
      const getPostsCount = () => {
        const match = html.match(/(\d+(?:[,.]\d+)*)\s*Posts/i);
        return match ? parseInt(match[1].replace(/[,.]/g, '')) : null;
      };

      // Extract bio
      const getBio = () => {
        const match = html.match(/<meta name="description" content="([^"]*)">/i);
        return match ? match[1] : null;
      };

      const profileData = {
        username: cleanUsername,
        bio: getBio(),
        followers: getFollowerCount(),
        following: getFollowingCount(),
        posts: getPostsCount(),
        isPrivate: html.includes('"Private Account"') || html.includes('"This Account is Private"'),
        engagement_rate: null // Calculate if needed based on available data
      };

      console.log('Extracted profile data:', profileData);

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