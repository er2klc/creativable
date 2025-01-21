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
      console.log('Scanning Instagram profile:', username);
      
      // Fetch the Instagram profile page
      const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`);
      const text = await response.text();
      
      console.log('Instagram API response:', text);
      
      try {
        const data = JSON.parse(text);
        console.log('Parsed Instagram data:', data);
        
        if (data.graphql && data.graphql.user) {
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
        console.error('Error parsing Instagram response:', parseError);
        
        // Try alternative parsing method for different response format
        const altDataMatch = text.match(/<script type="application\/ld\+json">(.*?)<\/script>/);
        if (altDataMatch) {
          try {
            const altData = JSON.parse(altDataMatch[1]);
            console.log('Alternative parsed data:', altData);
            
            return new Response(
              JSON.stringify({
                followers: extractNumber(altData.mainEntityofPage?.interactionStatistic?.userInteractionCount),
                following: null,
                posts: null,
                bio: altData.description,
                isPrivate: null,
                engagement_rate: null,
                profile_pic_url: altData.image
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (altParseError) {
            console.error('Error parsing alternative data:', altParseError);
          }
        }
      }
      
      // If we reach here, try one more fallback method using regex
      const followersMatch = text.match(/"edge_followed_by":{"count":(\d+)}/);
      const followingMatch = text.match(/"edge_follow":{"count":(\d+)}/);
      const postsMatch = text.match(/"edge_owner_to_timeline_media":{"count":(\d+)}/);
      const bioMatch = text.match(/"biography":"([^"]+)"/);
      const isPrivateMatch = text.match(/"is_private":(\w+)/);
      const profilePicMatch = text.match(/"profile_pic_url_hd":"([^"]+)"/);

      const data = {
        followers: followersMatch ? parseInt(followersMatch[1]) : null,
        following: followingMatch ? parseInt(followingMatch[1]) : null,
        posts: postsMatch ? parseInt(postsMatch[1]) : null,
        bio: bioMatch ? bioMatch[1].replace(/\\n/g, '\n') : null,
        isPrivate: isPrivateMatch ? isPrivateMatch[1] === 'true' : null,
        engagement_rate: null,
        profile_pic_url: profilePicMatch ? profilePicMatch[1].replace(/\\/g, '') : null
      };

      console.log('Extracted Instagram data:', data);
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Unsupported platform');
  } catch (error) {
    console.error('Error scanning profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
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

function extractNumber(str: string | null | undefined): number | null {
  if (!str) return null;
  const match = str.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}