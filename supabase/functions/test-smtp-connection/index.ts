
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface TestResult {
  success: boolean;
  error?: string;
  details?: string;
  stages?: Array<{
    name: string;
    success: boolean;
    message: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let stages: Array<{
    name: string;
    success: boolean;
    message: string;
  }> = [];

  try {
    const { host, port, username, password, secure, use_saved_settings } = await req.json();
    let smtp_config;

    // Step 1: Get SMTP settings
    stages.push({
      name: "Collecting SMTP Settings",
      success: true,
      message: use_saved_settings ? "Using saved SMTP settings from database" : "Using provided SMTP settings",
    });

    let client;

    if (use_saved_settings) {
      // Fetch settings from database if using saved settings
      const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
      
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase environment variables");
      }

      stages.push({
        name: "Accessing Database",
        success: true,
        message: "Successfully accessed Supabase configuration",
      });

      // Get the user's JWT from the request
      const authHeader = req.headers.get('authorization') || '';
      const jwt = authHeader.replace('Bearer ', '');

      if (!jwt) {
        throw new Error("Authentication required");
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

      // Query the database for the SMTP settings
      const settingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/smtp_settings?user_id=eq.${userId}&select=*`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
      });

      const settings = await settingsResponse.json();
      
      if (!settings || settings.length === 0) {
        throw new Error("No SMTP settings found for this user");
      }

      smtp_config = settings[0];
      
      stages.push({
        name: "Retrieving SMTP Settings",
        success: true,
        message: `Found SMTP settings for server: ${smtp_config.host}:${smtp_config.port}`,
      });
    } else {
      // Use provided settings directly
      smtp_config = {
        host,
        port: parseInt(port),
        username,
        password,
        secure: secure === true || secure === "true",
      };
      
      stages.push({
        name: "Validating SMTP Settings",
        success: true,
        message: `Using provided settings for server: ${smtp_config.host}:${smtp_config.port}`,
      });
    }

    // Step 2: Validate configuration
    if (!smtp_config.host || !smtp_config.port || !smtp_config.username || !smtp_config.password) {
      throw new Error("Incomplete SMTP configuration");
    }

    // Step 3: DNS resolution check
    try {
      stages.push({
        name: "DNS Resolution",
        success: true,
        message: "Starting DNS resolution test",
      });
      
      const dnsStartTime = Date.now();
      const dnsLookup = await Deno.resolveDns(smtp_config.host, "A");
      const dnsEndTime = Date.now();
      
      stages[stages.length - 1] = {
        name: "DNS Resolution",
        success: true,
        message: `Successfully resolved ${smtp_config.host} to ${dnsLookup.join(", ")} in ${dnsEndTime - dnsStartTime}ms`,
      };
    } catch (error) {
      stages[stages.length - 1] = {
        name: "DNS Resolution",
        success: false,
        message: `Failed to resolve DNS for ${smtp_config.host}: ${error.message}`,
      };
      throw new Error(`DNS resolution failed: ${error.message}`);
    }

    // Step 4: Create SMTP client
    stages.push({
      name: "SMTP Client Creation",
      success: true,
      message: "Creating SMTP client configuration",
    });

    client = new SMTPClient({
      connection: {
        hostname: smtp_config.host,
        port: smtp_config.port,
        tls: smtp_config.secure,
        auth: {
          username: smtp_config.username,
          password: smtp_config.password,
        },
        // Set timeout for connection to 15 seconds
        timeout: 15000,
      },
    });

    // Step 5: Connect to server
    stages.push({
      name: "SMTP Connection",
      success: false,
      message: "Connecting to SMTP server...",
    });

    const connectionStartTime = Date.now();
    await client.connect();
    const connectionEndTime = Date.now();

    stages[stages.length - 1] = {
      name: "SMTP Connection",
      success: true,
      message: `Successfully connected to ${smtp_config.host}:${smtp_config.port} in ${connectionEndTime - connectionStartTime}ms`,
    };

    // Step 6: Test authentication
    stages.push({
      name: "SMTP Authentication",
      success: false,
      message: "Testing authentication credentials...",
    });

    // Authentication is handled automatically during connect if credentials are provided
    // If connect succeeded, auth succeeded
    stages[stages.length - 1] = {
      name: "SMTP Authentication",
      success: true,
      message: "Authentication successful",
    };

    // Step 7: Close connection gracefully
    stages.push({
      name: "Connection Cleanup",
      success: false,
      message: "Closing SMTP connection...",
    });
    
    await client.close();
    
    stages[stages.length - 1] = {
      name: "Connection Cleanup",
      success: true,
      message: "SMTP connection closed properly",
    };

    const result: TestResult = {
      success: true,
      stages,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("SMTP test error:", error);
    
    // Add failure to the last stage if there was one in progress
    if (stages.length > 0 && !stages[stages.length - 1].success) {
      stages[stages.length - 1].message = `Failed: ${error.message}`;
    }

    const result: TestResult = {
      success: false,
      error: error.message,
      details: error.stack,
      stages,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200, // Still return 200 so frontend gets our detailed error info
    });
  }
});
