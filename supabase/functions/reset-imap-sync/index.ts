
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error("Missing user_id parameter");
    }
    
    // Get the user's JWT from the request to verify auth
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    
    if (!jwt) {
      throw new Error("Authentication required");
    }
    
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Verify the user is accessing their own data
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY
      },
    });
    
    const userData = await userResponse.json();
    if (!userData.id) {
      throw new Error("Failed to get user information");
    }
    
    if (userData.id !== user_id) {
      throw new Error("Unauthorized: You can only reset your own sync state");
    }
    
    // Reset the IMAP settings sync state
    const resetResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/reset_imap_settings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          user_id_param: user_id
        })
      }
    );
    
    if (!resetResponse.ok) {
      const errorText = await resetResponse.text();
      throw new Error(`Failed to reset IMAP settings: ${errorText}`);
    }
    
    console.log(`Successfully reset IMAP sync state for user ${user_id}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "IMAP sync state reset successfully" 
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error in reset-imap-sync function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 400,
      }
    );
  }
});
