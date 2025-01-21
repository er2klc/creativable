import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractInstagramStats } from "../_shared/social-media-utils.ts";

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
      const response = await fetch(`https://www.instagram.com/${username}/?__a=1`);
      const html = await response.text();
      
      // Extract stats using utility function
      const stats = extractInstagramStats(html);
      
      console.log('Extracted stats:', stats);
      
      return new Response(
        JSON.stringify(stats),
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