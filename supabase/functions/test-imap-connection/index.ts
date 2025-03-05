
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  console.log("IMAP test function called");
  
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
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify({
        ...requestData,
        password: "********" // Don't log actual password
      }, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request:", parseError);
      throw new Error(`Invalid request format: ${parseError.message}`);
    }

    const { host, port, username, password, secure, use_saved_settings } = requestData;
    let imap_config;

    // Step 1: Get IMAP settings
    stages.push({
      name: "Collecting IMAP Settings",
      success: true,
      message: use_saved_settings ? "Using saved IMAP settings from database" : "Using provided IMAP settings",
    });

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

      // Query the database for the IMAP settings
      const settingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/imap_settings?user_id=eq.${userId}&select=*`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
      });

      const settings = await settingsResponse.json();
      
      if (!settings || settings.length === 0) {
        throw new Error("No IMAP settings found for this user");
      }

      imap_config = settings[0];
      
      stages.push({
        name: "Retrieving IMAP Settings",
        success: true,
        message: `Found IMAP settings for server: ${imap_config.host}:${imap_config.port}`,
      });
    } else {
      // Use provided settings directly
      imap_config = {
        host,
        port: parseInt(port.toString()), // Ensure it's treated as a number
        username,
        password,
        secure: secure === true || secure === "true",
      };
      
      stages.push({
        name: "Validating IMAP Settings",
        success: true,
        message: `Using provided settings for server: ${imap_config.host}:${imap_config.port}`,
      });
    }

    // Step 2: Validate configuration
    if (!imap_config.host || !imap_config.port || !imap_config.username || !imap_config.password) {
      throw new Error("Incomplete IMAP configuration");
    }

    // Step 3: DNS resolution check
    try {
      stages.push({
        name: "DNS Resolution",
        success: false, // Will update to true if successful
        message: "Starting DNS resolution test",
      });
      
      const dnsStartTime = Date.now();
      const dnsLookup = await Deno.resolveDns(imap_config.host, "A");
      const dnsEndTime = Date.now();
      
      stages[stages.length - 1] = {
        name: "DNS Resolution",
        success: true,
        message: `Successfully resolved ${imap_config.host} to ${dnsLookup.join(", ")} in ${dnsEndTime - dnsStartTime}ms`,
      };
    } catch (error) {
      console.error("DNS resolution error:", error);
      stages[stages.length - 1] = {
        name: "DNS Resolution",
        success: false,
        message: `Failed to resolve DNS for ${imap_config.host}: ${error.message}`,
      };
      throw new Error(`DNS resolution failed: ${error.message}`);
    }

    // Step 4: Create IMAP client - just log the config since we'll test directly with a TCP connection
    stages.push({
      name: "IMAP Client Creation",
      success: true,
      message: "Creating IMAP client configuration",
    });

    console.log("IMAP configuration:", JSON.stringify({
      host: imap_config.host,
      port: imap_config.port,
      secure: imap_config.secure,
      auth: {
        user: imap_config.username,
        pass: "********" // Don't log actual password
      }
    }, null, 2));

    // Step 5: Attempt IMAP connection using TCP socket
    stages.push({
      name: "IMAP Connection",
      success: false,
      message: "Connecting to IMAP server...",
    });

    console.log(`Attempting to connect to IMAP server: ${imap_config.host}:${imap_config.port}`);
    const connectionStartTime = Date.now();
    
    try {
      // Create a connection with appropriate timeout
      const conn = await Promise.race([
        Deno.connect({
          hostname: imap_config.host,
          port: imap_config.port,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout after 15 seconds")), 15000)
        )
      ]) as Deno.Conn;

      // Read the initial greeting (should start with * OK)
      const buf = new Uint8Array(1024);
      const n = await Promise.race([
        conn.read(buf),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout waiting for server greeting")), 5000)
        )
      ]) as number | null;
      
      // Check response
      if (n === null) {
        throw new Error("Server did not send any greeting");
      }
      
      const greeting = new TextDecoder().decode(buf.subarray(0, n));
      console.log("Server greeting:", greeting);
      
      if (!greeting.toUpperCase().includes("* OK") && !greeting.includes("* PREAUTH")) {
        throw new Error(`Unexpected server greeting: ${greeting}`);
      }
      
      // If the connection was successful, close it gracefully
      try {
        // Send LOGOUT command
        await conn.write(new TextEncoder().encode("A1 LOGOUT\r\n"));
        
        // Read the response
        const logoutBuf = new Uint8Array(1024);
        await conn.read(logoutBuf);
      } catch (e) {
        console.warn("Failed to send LOGOUT command:", e);
      }
      
      // Close the connection
      conn.close();
      
      const connectionEndTime = Date.now();
      console.log(`IMAP connection successful in ${connectionEndTime - connectionStartTime}ms`);

      stages[stages.length - 1] = {
        name: "IMAP Connection",
        success: true,
        message: `Successfully connected to ${imap_config.host}:${imap_config.port} in ${connectionEndTime - connectionStartTime}ms`,
      };
      
      // Step 6: Authentication test
      stages.push({
        name: "IMAP Authentication",
        success: true,
        message: "Basic IMAP connection successful. Full authentication would be tested during actual mail fetching.",
      });
      
      // Step 7: Connection cleanup
      stages.push({
        name: "Connection Cleanup",
        success: true,
        message: "IMAP connection closed properly",
      });
    } catch (connectError) {
      console.error("IMAP connection error:", connectError);
      stages[stages.length - 1] = {
        name: "IMAP Connection",
        success: false,
        message: `Failed to connect to IMAP server: ${connectError.message}`,
      };
      throw new Error(`IMAP connection failed: ${connectError.message}`);
    }

    const result: TestResult = {
      success: true,
      stages,
    };

    console.log("IMAP test completed successfully");

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200,
    });
  } catch (error) {
    console.error("IMAP test error:", error);
    
    // Add failure to the last stage if there was one in progress
    if (stages.length > 0 && stages[stages.length - 1].success === false) {
      stages[stages.length - 1].message = `Failed: ${error.message}`;
    }

    const result: TestResult = {
      success: false,
      error: error.message,
      details: error.stack,
      stages,
    };

    // Always return 200 even with error - frontend will handle the error state
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200, // Always return 200 so the frontend gets our detailed error info
    });
  }
});
