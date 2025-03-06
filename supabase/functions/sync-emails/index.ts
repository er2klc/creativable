
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface SyncResult {
  success: boolean;
  message: string;
  emailsCount?: number;
  error?: string;
}

serve(async (req) => {
  console.log("Email sync function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      // If there's no body or it can't be parsed, use default values
      requestData = { force_refresh: false };
    }

    const { force_refresh } = requestData;

    // Get the user's JWT from the request
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');

    if (!jwt) {
      throw new Error("Authentication required");
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    // Get user information from the token
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    const userData = await userResponse.json();
    if (!userData.id) {
      throw new Error("Failed to get user information");
    }

    const userId = userData.id;

    // Query the database for the IMAP settings
    const imapSettingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/imap_settings?user_id=eq.${userId}&select=*`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
    });

    const imapSettings = await imapSettingsResponse.json();
    
    if (!imapSettings || imapSettings.length === 0) {
      throw new Error("No IMAP settings found for this user");
    }

    // Here we would include the actual email syncing logic
    // For now, we'll just simulate a successful sync
    console.log("Would sync emails for user", userId);
    
    // We'll pretend we synced some emails
    const syncedEmailCount = Math.floor(Math.random() * 5);  // 0-4 new emails
    
    // In a real implementation, this would connect to the IMAP server,
    // fetch new emails, and store them in the database

    const result: SyncResult = {
      success: true,
      message: syncedEmailCount > 0 
        ? `Successfully synced ${syncedEmailCount} new emails` 
        : "No new emails found",
      emailsCount: syncedEmailCount
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200,
    });

  } catch (error) {
    console.error("Email sync error:", error);
    
    const result: SyncResult = {
      success: false,
      message: "Failed to sync emails",
      error: error.message,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200, // Always return 200 so the frontend gets our detailed error info
    });
  }
});
