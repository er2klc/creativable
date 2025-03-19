
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error("User ID is required");
    }

    // Create a Supabase client with the Auth context of the user that called the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // First use the SQL function to reset emails and folders
    const { data: resetData, error: resetError } = await supabaseClient.rpc(
      'reset_imap_settings',
      { user_id_param: user_id }
    );

    if (resetError) {
      throw resetError;
    }

    // Now update the IMAP settings with better defaults
    const { data: imapSettings, error: imapError } = await supabaseClient
      .from('imap_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (imapError && imapError.code !== 'PGRST116') {
      throw imapError;
    }

    // Update with better defaults if settings exist
    if (imapSettings) {
      // Check if we need to update the port for secure connections
      const port = imapSettings.port === 143 ? 993 : imapSettings.port;
      
      const { error: updateError } = await supabaseClient
        .from('imap_settings')
        .update({
          port,
          secure: true, // Always use secure connections
          max_emails: 500, // Increase from default 100
          historical_sync: true, // Enable historical sync
          progressive_loading: true, // Enable progressive loading
          connection_timeout: 60000, // 60 second timeout
          auto_reconnect: true, // Enable automatic reconnection
          updated_at: new Date().toISOString()
        })
        .eq('id', imapSettings.id);

      if (updateError) {
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "IMAP settings reset successfully with optimized configuration"
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  } catch (error) {
    console.error("Error resetting IMAP settings:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An unknown error occurred" 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
        status: 400,
      }
    );
  }
});
