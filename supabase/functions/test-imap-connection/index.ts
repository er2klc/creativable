import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';
import { corsHeaders } from "../_shared/cors.ts";

interface ConnectionTestResult {
  success: boolean;
  message: string;
  diagnostics?: any;
  error?: string;
  errorDetails?: string;
  serverInfo?: any;
  folders?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const detailedDiagnostics = requestData.detailed_diagnostics || false;
    const connectionTimeout = requestData.connection_timeout || 30000;
    const testFolders = requestData.test_folders !== false;
    const verifyCredentials = requestData.verify_credentials !== false;

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
    const imapSettingsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/imap_settings?user_id=eq.${userId}&select=*`,
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

    // Configure IMAP client
    const settings = imapSettings[0];
    
    // Use optimized IMAP settings for testing
    const imapConfig = {
      host: settings.host,
      port: settings.port || 993,
      secure: settings.secure !== false, // Default to true if not set
      auth: {
        user: settings.username,
        pass: settings.password
      },
      logger: detailedDiagnostics, // Enable logging for detailed diagnostics
      tls: {
        rejectUnauthorized: false, // More permissive TLS for broader compatibility
        servername: settings.host,
        enableTrace: true, // Enable tracing for detailed diagnostics
        minVersion: '', // Keine Einschränkung der TLS-Version für maximale Kompatibilität
        ciphers: 'ALL' // Alle verfügbaren Cipher für maximale Kompatibilität
      },
      connectionTimeout: 120000, // Auf 2 Minuten erhöhen für langsame Verbindungen
      greetTimeout: 60000, // Auf 1 Minute erhöhen
      socketTimeout: 120000, // Auf 2 Minuten erhöhen
      disableCompression: true, // Disable compression for better stability
      requireTLS: false, // Do not require TLS
      upgradeTTLSeconds: 180, // 3 Minuten für TLS-Upgrade
      maxIdleTime: 30000 // 30 Sekunden maximale Idle-Zeit
    };

    const client = new ImapFlow(imapConfig);
    
    const result: ConnectionTestResult = {
      success: false,
      message: "IMAP connection test failed",
      diagnostics: {}
    };
    
    try {
      // Verbindungsversuch
      console.log("Attempting to connect to IMAP server...");
      
      // Create a connection timeout promise
      const connectPromise = client.connect();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Connection timed out after ${connectionTimeout}ms`));
        }, connectionTimeout);
      });
      
      // Race connection attempt vs. timeout
      await Promise.race([connectPromise, timeoutPromise]);
      
      console.log("Successfully connected to IMAP server");
      result.success = true;
      result.message = "Successfully connected to IMAP server";
      
      // Get server info
      if (client.serverInfo) {
        result.serverInfo = client.serverInfo;
      }
      
      // Test folder access if requested
      if (testFolders) {
        console.log("Testing folder access...");
        
        try {
          const mailboxes = await client.list();
          const folders = [];
          
          for (const mailbox of mailboxes) {
            folders.push({
              path: mailbox.path,
              name: mailbox.name,
              flags: mailbox.flags,
              specialUse: mailbox.specialUse,
              listed: mailbox.listed,
              subscribed: mailbox.subscribed
            });
          }
          
          result.folders = folders;
          console.log(`Found ${folders.length} folders`);
        } catch (folderError) {
          console.error("Error listing folders:", folderError);
          result.diagnostics.folderError = folderError.message;
        }
      }
      
      // Verify credentials if requested
      if (verifyCredentials) {
        console.log("Verifying credentials...");
        
        try {
          // Try to open INBOX as a basic credential check
          const inbox = await client.mailboxOpen("INBOX");
          result.diagnostics.inbox = {
            exists: inbox.exists,
            unseen: inbox.unseen,
            flags: inbox.flags
          };
        } catch (inboxError) {
          console.error("Error opening INBOX:", inboxError);
          result.diagnostics.inboxError = inboxError.message;
        }
      }
    } catch (connectionError) {
      console.error("Connection error:", connectionError);
      
      result.success = false;
      result.message = `Failed to connect to IMAP server: ${connectionError.message}`;
      result.error = connectionError.message;
      result.errorDetails = connectionError.stack;
      
      // Analyze the error for more detailed diagnostics
      if (connectionError.message.includes("certificate")) {
        result.diagnostics.certificateIssue = true;
      }
      
      if (connectionError.message.includes("auth") || connectionError.message.includes("credentials")) {
        result.diagnostics.authenticationIssue = true;
      }
      
      if (connectionError.message.includes("timeout")) {
        result.diagnostics.timeoutIssue = true;
      }
      
      if (connectionError.message.includes("socket")) {
        result.diagnostics.networkIssue = true;
      }
    } finally {
      // Make sure to close the connection
      try {
        if (client.usable) {
          await client.logout();
        }
      } catch (logoutError) {
        console.error("Error during logout:", logoutError);
      }
    }
    
    // Update IMAP settings with last verification status
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/imap_settings?id=eq.${settings.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            last_verification_status: result.success ? 'success' : 'failure',
            last_verified_at: new Date().toISOString(),
            last_error: result.success ? null : result.message
          })
        }
      );
    } catch (updateError) {
      console.error("Error updating verification status:", updateError);
    }
    
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Test IMAP connection error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to test IMAP connection",
        error: error.message,
        errorDetails: error.stack || "Unknown error"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200, // Return 200 even on error to get the error details on frontend
      }
    );
  }
});
