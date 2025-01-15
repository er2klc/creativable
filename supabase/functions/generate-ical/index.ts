import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("[iCal] Starting iCal generation process");
    
    const authHeader = req.headers.get('Authorization');
    console.log("[iCal] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Unauthorized: No Authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("[iCal] User auth error:", userError);
      throw new Error("Unauthorized: Invalid token");
    }

    // Get request body to check if this is for a team calendar
    const { teamId } = await req.json();
    
    // Generate the appropriate URL based on whether this is a team calendar or personal calendar
    const calendarUrl = teamId
      ? `${Deno.env.get('SUPABASE_URL')}/functions/v1/team-calendar/${teamId}/${user.id}`
      : `${Deno.env.get('SUPABASE_URL')}/functions/v1/calendar/${user.id}`;
    
    console.log("[iCal] Successfully generated calendar URL");

    return new Response(
      JSON.stringify({ url: calendarUrl }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );

  } catch (error) {
    console.error("[iCal] Error:", error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: error.message?.includes('Unauthorized') ? 401 : 500,
      },
    );
  }
});