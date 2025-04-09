
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  details?: string;
  diagnostics?: {
    secure: boolean;
    port: number;
    alternativeTried: boolean;
    auth: boolean;
  };
}

async function testIMAPConnection(settings: any): Promise<TestResult> {
  console.log(`Testing connection to IMAP server: ${settings.host}:${settings.port} (secure: ${settings.secure})`);
  
  const diagnostics = {
    secure: settings.secure,
    port: settings.port,
    alternativeTried: false,
    auth: false
  };
  
  const client = new ImapFlow({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.username,
      pass: settings.password
    },
    logger: false,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: settings.connection_timeout || 30000,
    greetTimeout: 15000,
    socketTimeout: 30000
  });
  
  try {
    await client.connect();
    console.log("Successfully connected to IMAP server");
    
    // Test authentication by listing mailboxes
    diagnostics.auth = true;
    const list = await client.list();
    console.log(`Found ${list.length} mailboxes`);
    
    // Try to select INBOX to verify it's working
    await client.mailboxOpen('INBOX');
    console.log("Successfully selected INBOX");
    
    await client.logout();
    
    return {
      success: true,
      message: "Successfully connected to IMAP server",
      diagnostics
    };
  } catch (error: any) {
    console.error("IMAP connection test error:", error);
    
    // If it's a TLS/connection error and we haven't tried the alternative yet,
    // try with the opposite secure setting
    if (!diagnostics.alternativeTried && 
        (error.message.includes("TLS") || 
         error.message.includes("greeting") || 
         error.message.includes("timeout") ||
         error.message.includes("connection"))) {
      
      console.log("Trying alternative connection settings");
      diagnostics.alternativeTried = true;
      
      // Close the current client if it's still usable
      if (client && client.usable) {
        await client.close();
      }
      
      // Try the opposite secure setting
      const altSecure = !settings.secure;
      // Use the appropriate default port for the security setting
      const altPort = altSecure ? 993 : 143;
      
      console.log(`Trying alternative connection: secure=${altSecure}, port=${altPort}`);
      
      const altClient = new ImapFlow({
        host: settings.host,
        port: altPort,
        secure: altSecure,
        auth: {
          user: settings.username,
          pass: settings.password
        },
        logger: false,
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: settings.connection_timeout || 30000,
        greetTimeout: 15000,
        socketTimeout: 30000
      });
      
      try {
        await altClient.connect();
        console.log("Successfully connected with alternative settings");
        
        // Test authentication
        diagnostics.auth = true;
        await altClient.list();
        
        await altClient.logout();
        
        // Update diagnostics with the working settings
        diagnostics.secure = altSecure;
        diagnostics.port = altPort;
        
        return {
          success: true,
          message: "Successfully connected with alternative settings",
          details: `Connection successful using: secure=${altSecure}, port=${altPort}. Consider updating your settings.`,
          diagnostics
        };
      } catch (altError) {
        console.error("Alternative connection also failed:", altError);
        
        // If both attempts failed, return the original error
        let errorMessage = "Failed to connect to IMAP server";
        
        if (error.message.includes("auth") || error.message.includes("login")) {
          errorMessage = "Authentication failed. Please check your username and password.";
        } else if (error.message.includes("certificate")) {
          errorMessage = "Certificate verification failed. Try enabling/disabling SSL or checking server settings.";
        } else if (error.message.includes("timeout") || error.message.includes("GREETING")) {
          errorMessage = "Connection timed out. Server may be down or blocked.";
        } else if (error.message.includes("connect")) {
          errorMessage = "Could not connect to server. Check hostname and port.";
        }
        
        return {
          success: false,
          message: errorMessage,
          error: error.message,
          details: `Both connection attempts failed. Original: ${error.message}, Alternative: ${altError.message}`,
          diagnostics
        };
      } finally {
        if (altClient && altClient.usable) {
          altClient.close();
        }
      }
    }
    
    // If no alternative was tried or it's not a connection issue, just return the error
    let errorMessage = "Failed to connect to IMAP server";
    
    if (error.message.includes("auth") || error.message.includes("login")) {
      errorMessage = "Authentication failed. Please check your username and password.";
    } else if (error.message.includes("certificate")) {
      errorMessage = "Certificate verification failed. Try enabling/disabling SSL.";
    } else if (error.message.includes("timeout") || error.message.includes("GREETING")) {
      errorMessage = "Connection timed out. Server may be down or wrong port/SSL settings.";
    } else if (error.message.includes("connect")) {
      errorMessage = "Could not connect to server. Check hostname and port.";
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message,
      diagnostics
    };
  } finally {
    // Make sure to close the client
    if (client && client.usable) {
      client.close();
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request
    const { host, port, username, password, secure, connection_timeout, use_saved_settings, user_id } = await req.json();

    // Validate required fields if not using saved settings
    if (!use_saved_settings && (!host || !username || !password)) {
      throw new Error("Missing required IMAP settings");
    }

    let testSettings;
    
    // If using saved settings, fetch them from the database
    if (use_saved_settings) {
      if (!user_id) {
        throw new Error("User ID is required when using saved settings");
      }
      
      const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/imap_settings?user_id=eq.${user_id}&select=*`, {
        headers: {
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch saved settings: ${response.statusText}`);
      }
      
      const savedSettings = await response.json();
      
      if (!savedSettings || savedSettings.length === 0) {
        throw new Error("No saved IMAP settings found");
      }
      
      testSettings = savedSettings[0];
    } else {
      // Use the provided settings
      testSettings = {
        host,
        port: port || 993,
        username,
        password,
        secure: secure !== undefined ? secure : true,
        connection_timeout: connection_timeout || 30000
      };
    }

    // Test the connection
    const result = await testIMAPConnection(testSettings);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error processing request",
        error: error.message
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
