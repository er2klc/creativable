import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/social-media-utils.ts";
import { scanInstagramProfile } from "./instagram.ts";
import { scanLinkedInProfile } from "./linkedin.ts";

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