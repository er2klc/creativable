import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, platform, username } = await req.json();

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

    // Here we would normally make the API call to scan the profile
    // For now, we'll return a mock successful response
    return new Response(
      JSON.stringify({
        message: "Profile scanned successfully",
        data: {
          bio: "Mock bio data",
          interests: ["interest1", "interest2"],
          posts: []
        },
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