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
    const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram profile: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      bio: data.graphql?.user?.biography || '',
      followers: data.graphql?.user?.edge_followed_by?.count || 0,
      following: data.graphql?.user?.edge_follow?.count || 0,
      posts: data.graphql?.user?.edge_owner_to_timeline_media?.count || 0,
      interests: [], // Instagram doesn't provide interests directly
      fullName: data.graphql?.user?.full_name || '',
      isPrivate: data.graphql?.user?.is_private || false,
    };
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    throw error;
  }
}

async function scanLinkedInProfile(username: string) {
  console.log('Scanning LinkedIn profile for:', username);
  try {
    // Note: LinkedIn requires OAuth for API access
    // This is a simplified example - in production, you'd use the LinkedIn API with proper authentication
    const response = await fetch(`https://www.linkedin.com/in/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract basic information from HTML
    // Note: This is a simplified example. In production, you should use LinkedIn's API
    return {
      bio: extractFromHtml(html, 'description'),
      connections: extractFromHtml(html, 'connections'),
      posts: 0, // Requires API access
      interests: [], // Requires API access
      fullName: extractFromHtml(html, 'full-name'),
      headline: extractFromHtml(html, 'headline'),
    };
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    throw error;
  }
}

function extractFromHtml(html: string, field: string): string {
  // Simple HTML parsing - in production, use a proper HTML parser
  const patterns: Record<string, RegExp> = {
    'description': /<div class="description">(.*?)<\/div>/i,
    'connections': /(\d+)\s+connections/i,
    'full-name': /<h1[^>]*>(.*?)<\/h1>/i,
    'headline': /<div class="headline">(.*?)<\/div>/i,
  };
  
  const match = html.match(patterns[field]);
  return match ? match[1].trim() : '';
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

    // Update lead with scanned data
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        social_media_bio: profileData.bio,
        social_media_interests: profileData.interests,
        social_media_posts: {
          followers: profileData.followers,
          following: profileData.following,
          posts: profileData.posts,
          fullName: profileData.fullName,
          isPrivate: profileData.isPrivate,
          headline: profileData.headline,
          connections: profileData.connections,
        },
        last_social_media_scan: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) throw updateError;

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