
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';
import { corsHeaders } from "../_shared/cors.ts";

interface ImapSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  use_saved_settings?: boolean;
}

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  details?: string;
  connectionInfo?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData: ImapSettings = await req.json();
    console.log("IMAP connection test request received for host:", requestData.host);

    // Get the user's JWT from the request if we need to use saved settings
    let userId;
    let savedSettings;
    
    if (requestData.use_saved_settings) {
      const authHeader = req.headers.get('authorization') || '';
      const jwt = authHeader.replace('Bearer ', '');

      if (!jwt) {
        throw new Error("Authentication required to use saved settings");
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

      userId = userData.id;

      // Fetch IMAP settings for the user
      const imapSettingsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/imap_settings?user_id=eq.${userId}&select=*`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
          },
        }
      );

      savedSettings = await imapSettingsResponse.json();
      
      if (!savedSettings || savedSettings.length === 0) {
        throw new Error("No IMAP settings found for this user");
      }
      
      // Use saved settings
      requestData.host = savedSettings[0].host;
      requestData.port = savedSettings[0].port;
      requestData.secure = savedSettings[0].secure;
      requestData.username = savedSettings[0].username;
      requestData.password = savedSettings[0].password;
    }

    // Validate required fields
    if (!requestData.host || !requestData.port || !requestData.username || !requestData.password) {
      throw new Error("Missing required fields: host, port, username, password");
    }

    // Configure IMAP client with permissive settings
    const client = new ImapFlow({
      host: requestData.host,
      port: requestData.port,
      secure: requestData.secure,
      auth: {
        user: requestData.username,
        pass: requestData.password
      },
      logger: false,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates for testing
        servername: requestData.host,
        minVersion: 'TLSv1'
      },
      connectionTimeout: 30000, // 30 seconds timeout
      greetTimeout: 15000,
      socketTimeout: 30000
    });

    console.log(`Testing connection to ${requestData.host}:${requestData.port} (secure: ${requestData.secure})`);
    
    // Set up connection timeout
    const connectionPromise = client.connect().then(async () => {
      // Try to list mailboxes as an additional check
      const folders = await client.list();
      console.log(`Successfully listed ${folders.length} folders`);
      
      // Gracefully close connection
      await client.logout();
      
      return {
        success: true,
        folderCount: folders.length
      };
    });
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Connection timed out after 30 seconds"));
      }, 30000);
    });
    
    // Race connection attempt vs. timeout
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully connected to IMAP server and found ${result.folderCount} folders`,
        connectionInfo: {
          host: requestData.host,
          port: requestData.port,
          secure: requestData.secure,
          username: requestData.username
        }
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("IMAP connection test error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to connect to IMAP server",
        error: error.message,
        details: error.stack || "Unknown error during connection test"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200, // Return 200 even on error to get details on frontend
      }
    );
  }
});
