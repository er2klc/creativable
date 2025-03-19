
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface ImapSettings {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  }
  logger: boolean;
  tls: {
    rejectUnauthorized: boolean;
    servername?: string;
    enableTrace?: boolean;
    minVersion?: string;
  };
  connectionTimeout: number;
  greetTimeout: number;
  socketTimeout: number;
}

interface TestRequest {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  use_saved_settings?: boolean;
  tls_options?: {
    rejectUnauthorized: boolean;
    enableTrace?: boolean;
    minVersion?: string;
  };
  timeout?: number;
}

// Function to test IMAP connection
async function testImapConnection(imapSettings: ImapSettings): Promise<{ success: boolean; error?: string; details?: string; folders?: any[] }> {
  console.log(`Testing IMAP connection to: ${imapSettings.host}:${imapSettings.port} (secure: ${imapSettings.secure})`);
  
  const client = new ImapFlow(imapSettings);
  
  try {
    console.log("Attempting to connect to IMAP server...");
    
    // Create a connection timeout promise
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection timed out after ${imapSettings.connectionTimeout}ms`));
      }, imapSettings.connectionTimeout);
    });
    
    // Race the connection and timeout
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log("Successfully connected to IMAP server!");
    
    // Try to list folders as a better test
    console.log("Attempting to list folders...");
    const folderList = await client.list();
    console.log(`Successfully listed ${folderList.length} folders`);
    
    // Proper logout
    try {
      await client.logout();
      console.log("Successfully logged out from IMAP server");
    } catch (logoutError) {
      console.error("Error during IMAP logout:", logoutError);
    }
    
    return {
      success: true,
      folders: folderList.map(folder => ({
        name: folder.name,
        path: folder.path,
        specialUse: folder.specialUse
      })).slice(0, 5) // Return just the first 5 folders
    };
  } catch (error) {
    console.error("IMAP connection test error:", error);
    
    let errorMessage = error.message || "Unknown error";
    
    // Provide more friendly error messages
    if (error.message.includes("auth") || error.message.includes("credentials")) {
      errorMessage = "Authentication failed. Please check your username and password.";
    } else if (error.message.includes("certificate") || error.message.includes("TLS")) {
      errorMessage = "Secure connection failed. Try changing the security settings.";
    } else if (error.message.includes("timeout") || error.message.includes("Failed to upgrade")) {
      errorMessage = "Connection timed out. The server took too long to respond.";
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      errorMessage = "Server not found. Please check the hostname.";
    }
    
    return {
      success: false,
      error: errorMessage,
      details: error.stack || "No stack trace available"
    };
  } finally {
    // Ensure client is closed
    if (client.usable) {
      try {
        client.close();
      } catch (closeError) {
        console.error("Error closing IMAP client:", closeError);
      }
    }
  }
}

// Main handler for the edge function
serve(async (req) => {
  console.log("Test IMAP connection function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    let requestData: TestRequest;
    try {
      requestData = await req.json();
      console.log("Request data received (hiding password):", {
        ...requestData,
        password: requestData.password ? "********" : undefined
      });
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      throw new Error("Invalid request body");
    }
    
    const { 
      host, 
      port, 
      username, 
      password, 
      secure, 
      use_saved_settings = false,
      tls_options = {
        rejectUnauthorized: false,
        enableTrace: true,
        minVersion: "TLSv1"
      },
      timeout = 60000  // Increased default timeout to 60 seconds
    } = requestData;
    
    // Validate required parameters
    if (use_saved_settings === false && (!host || !port || !username || !password)) {
      throw new Error("Missing required parameters: host, port, username, password");
    }
    
    // If using saved settings, get them from the database
    if (use_saved_settings) {
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
      
      // Query the database for the IMAP settings
      const imapSettingsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/imap_settings?user_id=eq.${userData.id}&select=*`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      
      const imapSettings = await imapSettingsResponse.json();
      
      if (!imapSettings || imapSettings.length === 0) {
        throw new Error("No IMAP settings found for this user");
      }
      
      // Use the saved settings
      const savedSettings = imapSettings[0];
      
      const imapConfig: ImapSettings = {
        host: savedSettings.host,
        port: savedSettings.port,
        secure: savedSettings.secure,
        auth: {
          user: savedSettings.username,
          pass: savedSettings.password
        },
        logger: true,
        tls: {
          rejectUnauthorized: false,
          servername: savedSettings.host,
          enableTrace: true,
          minVersion: "TLSv1"
        },
        connectionTimeout: timeout,
        greetTimeout: 15000,
        socketTimeout: timeout
      };
      
      const result = await testImapConnection(imapConfig);
      
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      });
    } else {
      // Use the provided settings
      const imapConfig: ImapSettings = {
        host,
        port,
        secure,
        auth: {
          user: username,
          pass: password
        },
        logger: true,
        tls: {
          rejectUnauthorized: tls_options.rejectUnauthorized,
          servername: host,
          enableTrace: tls_options.enableTrace,
          minVersion: tls_options.minVersion
        },
        connectionTimeout: timeout,
        greetTimeout: 15000,
        socketTimeout: timeout
      };
      
      const result = await testImapConnection(imapConfig);
      
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error in test-imap-connection function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "An unknown error occurred",
      details: error.stack || "No stack trace available"
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200, // Return 200 even on error to get the error details on frontend
    });
  }
});
