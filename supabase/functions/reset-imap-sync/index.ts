
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabase } from "../_shared/supabase.ts";

interface ResetSyncOptions {
  user_id: string;
  reset_cache?: boolean;
  optimize_settings?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json() as ResetSyncOptions;
    console.log("Reset IMAP sync request:", requestData);

    // Get the user's JWT from the request
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');

    if (!jwt) {
      throw new Error("Authentication required");
    }

    const supabase = getSupabase();
    
    // Verify the user
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !userData.user) {
      throw new Error("Failed to authenticate user");
    }

    // Use the user ID from the token or the requested ID if user is admin
    const userId = userData.user.id;
    
    // Validate that the user matches the requested user_id
    if (userId !== requestData.user_id) {
      throw new Error("Unauthorized: Cannot reset another user's sync state");
    }

    // 1. Reset email_sync_status
    await supabase
      .from('email_sync_status')
      .delete()
      .eq('user_id', userId);
    
    // 2. Update IMAP settings
    if (requestData.optimize_settings) {
      const { error: imapError } = await supabase
        .from('imap_settings')
        .update({
          historical_sync: false,
          syncing_historical: false,
          last_sync_date: null,
          last_sync_status: null,
          sync_progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (imapError) {
        console.error("Error updating IMAP settings:", imapError);
      }
    }
    
    // 3. Optionally clear email cache
    if (requestData.reset_cache) {
      await supabase
        .from('emails')
        .delete()
        .eq('user_id', userId);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sync state reset successfully"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error("Reset sync error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to reset email sync state",
        error: error.message
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 400
      }
    );
  }
});
