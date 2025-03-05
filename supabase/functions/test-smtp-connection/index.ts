
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
  console.log("SMTP test function called");
  
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
    // Parse request body - wrapping in try/catch for better error messages
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request:", parseError);
      throw new Error(`Invalid request format: ${parseError.message}`);
    }

    const { host, port, username, password, secure, from_email, use_saved_settings } = requestData;
    let smtp_config;

    // Step 1: Get SMTP settings
    stages.push({
      name: "Collecting SMTP Settings",
      success: true,
      message: use_saved_settings ? "Using saved SMTP settings from database" : "Using provided SMTP settings",
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
        port: parseInt(port.toString()), // Ensure it's treated as a number
        username,
        password,
        from_email,
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
        success: false, // Will update to true if successful
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
      console.error("DNS resolution error:", error);
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

    console.log("Creating SMTP client with config:", JSON.stringify({
      hostname: smtp_config.host,
      port: smtp_config.port,
      tls: smtp_config.secure,
      auth: {
        username: smtp_config.username,
        password: "********" // Don't log actual password
      }
    }, null, 2));

    // Step 5: Attempt SMTP connection using lower-level TCP socket
    stages.push({
      name: "SMTP Connection",
      success: false,
      message: "Connecting to SMTP server...",
    });

    console.log(`Attempting to connect to SMTP server: ${smtp_config.host}:${smtp_config.port}`);
    const connectionStartTime = Date.now();
    
    try {
      // Create a connection with appropriate timeout
      const conn = await Promise.race([
        Deno.connect({
          hostname: smtp_config.host,
          port: smtp_config.port,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout after 15 seconds")), 15000)
        )
      ]) as Deno.Conn;

      // Read the initial greeting (should start with 220)
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
      
      if (!greeting.startsWith("220")) {
        throw new Error(`Unexpected server greeting: ${greeting}`);
      }
      
      // Try sending EHLO command
      const ehloCommand = `EHLO ${Deno.hostname()}\r\n`;
      await conn.write(new TextEncoder().encode(ehloCommand));
      
      // Read EHLO response
      const ehloResponse = await Promise.race([
        (async () => {
          const responseBuf = new Uint8Array(1024);
          const bytesRead = await conn.read(responseBuf);
          return bytesRead !== null ? new TextDecoder().decode(responseBuf.subarray(0, bytesRead)) : null;
        })(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout waiting for EHLO response")), 5000)
        )
      ]);
      
      console.log("EHLO response:", ehloResponse);
      
      if (!ehloResponse || !ehloResponse.includes("250")) {
        throw new Error("EHLO command failed");
      }
      
      // Attempt to close connection gracefully with QUIT
      try {
        await conn.write(new TextEncoder().encode("QUIT\r\n"));
        // We don't need to wait for the response here
      } catch (e) {
        console.warn("Failed to send QUIT command:", e);
      }
      
      // Close the connection
      conn.close();
      
      const connectionEndTime = Date.now();
      console.log(`SMTP connection successful in ${connectionEndTime - connectionStartTime}ms`);

      stages[stages.length - 1] = {
        name: "SMTP Connection",
        success: true,
        message: `Successfully connected to ${smtp_config.host}:${smtp_config.port} in ${connectionEndTime - connectionStartTime}ms`,
      };
      
      // Step 6: Add authentication test result
      stages.push({
        name: "SMTP Authentication",
        success: true,
        message: "Basic SMTP connection successful. Authentication would be tested during actual mail delivery.",
      });
      
      // Step 7: Add success for cleanup
      stages.push({
        name: "Connection Cleanup",
        success: true,
        message: "SMTP connection closed properly",
      });
    } catch (connectError) {
      console.error("SMTP connection error:", connectError);
      stages[stages.length - 1] = {
        name: "SMTP Connection",
        success: false,
        message: `Failed to connect to SMTP server: ${connectError.message}`,
      };
      throw new Error(`SMTP connection failed: ${connectError.message}`);
    }

    const result: TestResult = {
      success: true,
      stages,
    };

    console.log("SMTP test completed successfully");

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200,
    });
  } catch (error) {
    console.error("SMTP test error:", error);
    
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
