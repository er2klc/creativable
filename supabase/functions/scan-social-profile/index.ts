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
      
      // First try with __a=1 parameter
      let response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      let text = await response.text();
      console.log('Initial response status:', response.status);
      
      // If first attempt fails, try without parameters
      if (!text || text.includes('login') || response.status === 404) {
        console.log('Trying alternative fetch method...');
        response = await fetch(`https://www.instagram.com/${username}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        text = await response.text();
      }
      
      console.log('Response received, length:', text.length);
      
      // Try to parse JSON response
      try {
        const data = JSON.parse(text);
        console.log('Successfully parsed JSON response');
        
        if (data.graphql?.user) {
          const user = data.graphql.user;
          return new Response(
            JSON.stringify({
              followers: user.edge_followed_by.count,
              following: user.edge_follow.count,
              posts: user.edge_owner_to_timeline_media.count,
              bio: user.biography,
              isPrivate: user.is_private,
              engagement_rate: calculateEngagementRate(user),
              profile_pic_url: user.profile_pic_url_hd
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (parseError) {
        console.log('JSON parse failed, trying alternative methods');
        
        // Try to extract data using regex patterns
        const followersMatch = text.match(/\"edge_followed_by\":\{\"count\":(\d+)\}/);
        const followingMatch = text.match(/\"edge_follow\":\{\"count\":(\d+)\}/);
        const postsMatch = text.match(/\"edge_owner_to_timeline_media\":\{\"count\":(\d+)\}/);
        const bioMatch = text.match(/\"biography\":\"([^\"]+)\"/);
        const isPrivateMatch = text.match(/\"is_private\":(\w+)/);
        const profilePicMatch = text.match(/\"profile_pic_url_hd\":\"([^\"]+)\"/);
        
        console.log('Regex matches found:', {
          followers: !!followersMatch,
          following: !!followingMatch,
          posts: !!postsMatch,
          bio: !!bioMatch,
          isPrivate: !!isPrivateMatch,
          profilePic: !!profilePicMatch
        });

        // Try to find meta tags if regex fails
        if (!followersMatch && !bioMatch) {
          const metaDescription = text.match(/<meta name="description" content="([^"]*)">/);
          const metaImage = text.match(/<meta property="og:image" content="([^"]*)">/);
          
          if (metaDescription || metaImage) {
            return new Response(
              JSON.stringify({
                bio: metaDescription ? metaDescription[1] : null,
                profile_pic_url: metaImage ? metaImage[1] : null,
                followers: null,
                following: null,
                posts: null,
                isPrivate: null,
                engagement_rate: null
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const data = {
          followers: followersMatch ? parseInt(followersMatch[1]) : null,
          following: followingMatch ? parseInt(followingMatch[1]) : null,
          posts: postsMatch ? parseInt(postsMatch[1]) : null,
          bio: bioMatch ? bioMatch[1].replace(/\\n/g, '\n') : null,
          isPrivate: isPrivateMatch ? isPrivateMatch[1] === 'true' : null,
          engagement_rate: null,
          profile_pic_url: profilePicMatch ? profilePicMatch[1].replace(/\\/g, '') : null
        };

        console.log('Extracted data:', data);
        
        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    throw new Error('Unsupported platform');
  } catch (error) {
    console.error('Error scanning profile:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        followers: null,
        following: null,
        posts: null,
        bio: null,
        isPrivate: null,
        engagement_rate: null,
        profile_pic_url: null
      }),
      { 
        status: 200, // Return 200 even on error, but with null values
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function calculateEngagementRate(user: any) {
  if (!user.edge_followed_by?.count || !user.edge_owner_to_timeline_media?.edges) {
    return null;
  }
  
  const followers = user.edge_followed_by.count;
  const recentPosts = user.edge_owner_to_timeline_media.edges.slice(0, 10);
  
  if (recentPosts.length === 0) return null;
  
  const totalEngagement = recentPosts.reduce((sum: number, post: any) => {
    return sum + (post.node.edge_liked_by?.count || 0) + (post.node.edge_media_to_comment?.count || 0);
  }, 0);
  
  return (totalEngagement / recentPosts.length / followers) * 100;
}