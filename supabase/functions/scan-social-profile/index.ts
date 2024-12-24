import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanProfileRequest {
  leadId: string;
  platform: string;
  username: string;
}

async function scanInstagramProfile(username: string) {
  console.log('Scanning Instagram profile for:', username);
  try {
    // First try the Instagram API
    const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.log('Instagram API response not ok, trying HTML scraping:', response.status);
      // Fallback to scraping the page directly
      const htmlResponse = await fetch(`https://www.instagram.com/${username}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!htmlResponse.ok) {
        throw new Error(`Failed to fetch Instagram profile: ${htmlResponse.statusText}`);
      }

      const html = await htmlResponse.text();
      
      // Extract data using regex
      const followersMatch = html.match(/"edge_followed_by":{"count":(\d+)}/);
      const followingMatch = html.match(/"edge_follow":{"count":(\d+)}/);
      const postsMatch = html.match(/"edge_owner_to_timeline_media":{"count":(\d+)}/);
      const bioMatch = html.match(/"biography":"([^"]+)"/);
      const isPrivateMatch = html.match(/"is_private":(\w+)/);
      
      console.log('Extracted data from HTML:', {
        followers: followersMatch?.[1],
        following: followingMatch?.[1],
        posts: postsMatch?.[1],
        bio: bioMatch?.[1],
        isPrivate: isPrivateMatch?.[1]
      });

      return {
        followers: followersMatch ? parseInt(followersMatch[1]) : null,
        following: followingMatch ? parseInt(followingMatch[1]) : null,
        posts: postsMatch ? parseInt(postsMatch[1]) : null,
        bio: bioMatch ? bioMatch[1].replace(/\\n/g, '\n') : null,
        isPrivate: isPrivateMatch ? isPrivateMatch[1] === 'true' : null,
      };
    }

    const data = await response.json();
    console.log('Instagram API data:', data);
    
    return {
      bio: data.graphql?.user?.biography || null,
      followers: data.graphql?.user?.edge_followed_by?.count || null,
      following: data.graphql?.user?.edge_follow?.count || null,
      posts: data.graphql?.user?.edge_owner_to_timeline_media?.count || null,
      isPrivate: data.graphql?.user?.is_private || null,
    };
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {
      error: `Failed to scan Instagram profile: ${error.message}`,
      followers: null,
      following: null,
      posts: null,
      bio: null,
      isPrivate: null
    };
  }
}

async function scanLinkedInProfile(username: string) {
  console.log('Scanning LinkedIn profile for:', username);
  try {
    const response = await fetch(`https://www.linkedin.com/in/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract data using regex patterns
    const connectionsMatch = html.match(/(\d+)\s+connections?/i);
    const headlineMatch = html.match(/<div class="text-body-medium break-words">(.*?)<\/div>/);
    const postsMatch = html.match(/(\d+)\s+posts?/i);
    
    console.log('Extracted LinkedIn data:', {
      connections: connectionsMatch?.[1],
      headline: headlineMatch?.[1],
      posts: postsMatch?.[1]
    });

    return {
      connections: connectionsMatch ? parseInt(connectionsMatch[1]) : null,
      headline: headlineMatch ? headlineMatch[1].trim() : null,
      posts: postsMatch ? parseInt(postsMatch[1]) : null,
    };
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    return {
      error: `Failed to scan LinkedIn profile: ${error.message}`,
      connections: null,
      headline: null,
      posts: null
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, platform, username } = await req.json() as ScanProfileRequest;
    console.log('Received scan request:', { leadId, platform, username });

    if (!username || platform === "Offline") {
      return new Response(
        JSON.stringify({
          message: "No social media profile to scan for offline contacts",
          data: null
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let profileData;
    switch (platform.toLowerCase()) {
      case 'instagram':
        profileData = await scanInstagramProfile(username);
        break;
      case 'linkedin':
        profileData = await scanLinkedInProfile(username);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log('Scanned profile data:', profileData);

    if (profileData.error) {
      return new Response(
        JSON.stringify({
          error: profileData.error
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    // Update lead with scanned data
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        social_media_bio: profileData.bio,
        social_media_posts: {
          followers: profileData.followers,
          following: profileData.following,
          posts: profileData.posts,
          isPrivate: profileData.isPrivate,
          headline: profileData.headline,
          connections: profileData.connections,
        },
        last_social_media_scan: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        message: "Profile scanned successfully",
        data: profileData,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in scan-social-profile:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});