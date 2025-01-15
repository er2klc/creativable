import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Loading iCal function...");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("[iCal] Starting iCal generation process");
    
    // Get auth header and validate
    const authHeader = req.headers.get('Authorization');
    console.log("[iCal] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Unauthorized: No Authorization header provided");
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Get the user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("[iCal] User auth error:", userError);
      throw new Error("Unauthorized: Invalid token");
    }

    // Generate a unique URL for the user's calendar
    const calendarUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/calendar/${user.id}`;
    
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