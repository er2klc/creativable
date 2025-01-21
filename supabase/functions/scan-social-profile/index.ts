import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { scanInstagramProfile } from "./instagram.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface ScanProfileRequest {
  leadId: string;
  platform: string;
  username: string;
}

serve(async (req) => {
  console.log('Received scan request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  try {
    const { leadId, platform, username } = await req.json() as ScanProfileRequest;
    console.log('Processing request:', { leadId, platform, username });

    if (!username || platform === "Offline") {
      console.log('No social media profile to scan');
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
    console.log(`Attempting to scan ${platform} profile for username: ${username}`);
    
    if (platform.toLowerCase() === 'instagram') {
      profileData = await scanInstagramProfile(username);
    } else {
      return new Response(
        JSON.stringify({
          error: `Unsupported platform: ${platform}`,
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

    console.log('Scanned profile data:', profileData);

    if (!profileData || Object.keys(profileData).length === 0) {
      console.log('No profile data found');
      return new Response(
        JSON.stringify({
          message: "No profile data found",
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

    // Update lead with scanned data
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        social_media_bio: profileData.bio,
        instagram_followers: profileData.followers,
        instagram_following: profileData.following,
        instagram_posts: profileData.posts,
        instagram_engagement_rate: profileData.engagement_rate,
        instagram_profile_image_url: profileData.profileImageUrl,
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
        status: 200,
      }
    );
  }
});