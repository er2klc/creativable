import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { scanInstagramProfile } from "./platforms/instagram.ts";
import { scanLinkedInProfile } from "./platforms/linkedin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, username, leadId } = await req.json();
    
    console.log('Starting social profile scan:', {
      platform,
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

    // Validate required inputs
    if (!platform || !username || !leadId) {
      console.error('Missing required fields:', { platform, username, leadId });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Required fields (platform, username, leadId) are missing'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let profileData;
    switch (platform.toLowerCase()) {
      case 'instagram':
        profileData = await scanInstagramProfile(username, leadId);
        break;
      case 'linkedin':
        profileData = await scanLinkedInProfile(username, leadId);
        break;
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unsupported platform: ${platform}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: profileData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error during social profile scan:', {
      message: error.message,
      details: error.stack,
      hint: error.hint || "",
      code: error.code || ""
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during scanning'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});