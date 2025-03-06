
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';

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
  details?: string;
}

interface EmailMessage {
  id: string;
  from: { value: Array<{ address: string; name: string }> };
  to: { value: Array<{ address: string; name: string }> };
  subject: string;
  text?: string;
  html?: string;
  date: Date;
}

interface ImapSettings {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  }
  logger: boolean;
  // Add timeout configurations
  tls: {
    rejectUnauthorized: boolean;
    servername?: string;
  };
  // Longer timeouts for edge function environment
  connectionTimeout: number;
  greetTimeout: number;
  socketTimeout: number;
  // Optional: Add proxy support if needed
  disableCompression?: boolean;
}

async function fetchEmails(imapSettings: ImapSettings, userId: string, forceRefresh = false, retryCount = 0): Promise<SyncResult> {
  console.log(`[Attempt ${retryCount + 1}] Connecting to IMAP server: ${imapSettings.host}:${imapSettings.port} (secure: ${imapSettings.secure})`);
  
  const client = new ImapFlow(imapSettings);
  
  try {
    // Connect with timeout
    const connectPromise = client.connect();
    const timeout = setTimeout(() => {
      if (client.usable) {
        client.close();
      }
      throw new Error(`Connection timed out after ${imapSettings.connectionTimeout}ms`);
    }, imapSettings.connectionTimeout);
    
    await connectPromise;
    clearTimeout(timeout);
    
    console.log("Successfully connected to IMAP server");
    
    // Select the mailbox
    const mailbox = await client.mailboxOpen('INBOX');
    console.log(`Mailbox opened with ${mailbox.exists} messages`);
    
    // Determine how many emails to fetch
    let fetchCount = forceRefresh ? 20 : 10; // Fetch more if force refresh
    const totalEmails = mailbox.exists;
    fetchCount = Math.min(fetchCount, totalEmails);
    
    if (fetchCount === 0) {
      return {
        success: true,
        message: "No emails found in inbox",
        emailsCount: 0
      };
    }
    
    // Get the most recent emails
    const fetchOptions = {
      // Get the last X emails, using sequence numbers
      seq: `${Math.max(1, totalEmails - fetchCount + 1)}:${totalEmails}`,
      envelope: true,
      bodyStructure: true,
      source: true
    };
    
    const emails = [];
    let counter = 0;
    
    // Fetch messages
    for await (const message of client.fetch(fetchOptions)) {
      console.log(`Processing message #${message.seq}`);
      
      // Extract email data
      const parsedEmail = {
        message_id: message.envelope.messageId,
        from_email: message.envelope.from?.[0]?.address || "unknown@example.com",
        from_name: message.envelope.from?.[0]?.name || "",
        to_email: message.envelope.to?.[0]?.address || "",
        to_name: message.envelope.to?.[0]?.name || "",
        subject: message.envelope.subject || "(No Subject)",
        content: message.source.toString(),
        html_content: null as string | null,
        text_content: null as string | null,
        sent_at: message.envelope.date,
        received_at: new Date(),
        user_id: userId,
        folder: "inbox",
        read: false
      };
      
      // Try to parse content
      try {
        const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
        
        // Store email in database using upsert to avoid duplicates
        const response = await fetch(`${SUPABASE_URL}/rest/v1/emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            message_id: parsedEmail.message_id,
            from_email: parsedEmail.from_email,
            from_name: parsedEmail.from_name,
            to_email: parsedEmail.to_email,
            to_name: parsedEmail.to_name,
            subject: parsedEmail.subject,
            content: parsedEmail.content,
            html_content: parsedEmail.html_content,
            text_content: parsedEmail.text_content,
            sent_at: parsedEmail.sent_at,
            received_at: parsedEmail.received_at,
            user_id: parsedEmail.user_id,
            folder: parsedEmail.folder,
            read: parsedEmail.read
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to store email: ${errorText}`);
        } else {
          counter++;
          emails.push(parsedEmail);
        }
      } catch (parseError) {
        console.error("Error processing email:", parseError);
      }
    }
    
    await client.logout();
    console.log(`Successfully fetched ${counter} emails`);
    
    return {
      success: true,
      message: `Successfully synced ${counter} emails`,
      emailsCount: counter
    };
    
  } catch (error) {
    console.error("IMAP error:", error);
    
    // Only retry for connection errors, not authentication errors
    if (retryCount < 2 && 
        (error.message.includes('timeout') || 
         error.message.includes('connection') || 
         error.message.includes('ECONNRESET') ||
         error.message.includes('Failed to upgrade'))) {
      
      console.log(`Retrying connection (${retryCount + 1}/2) with modified settings...`);
      
      // For first retry: try with different SSL settings
      if (retryCount === 0) {
        const newSettings = {
          ...imapSettings,
          secure: !imapSettings.secure, // Toggle secure setting
          port: imapSettings.secure ? 143 : 993, // Toggle port based on secure setting
          tls: {
            ...imapSettings.tls,
            rejectUnauthorized: false // Don't fail on invalid certificates for retry
          },
          connectionTimeout: imapSettings.connectionTimeout * 1.5, // Increase timeout
        };
        return fetchEmails(newSettings, userId, forceRefresh, retryCount + 1);
      } 
      // For second retry: try with very permissive settings and longer timeout
      else {
        const newSettings = {
          ...imapSettings,
          secure: true, // Force secure
          port: 993, // Standard secure port
          tls: {
            rejectUnauthorized: false
          },
          disableCompression: true, // Try disabling compression
          connectionTimeout: 60000, // Full minute timeout
          greetTimeout: 30000,
          socketTimeout: 60000
        };
        return fetchEmails(newSettings, userId, forceRefresh, retryCount + 1);
      }
    }
    
    let errorDetails = error.message || "Unknown error";
    let friendlyMessage = "Failed to sync emails";
    
    // Provide more friendly error messages
    if (error.message.includes("auth") || error.message.includes("credentials")) {
      friendlyMessage = "Authentication failed. Please check your username and password.";
    } else if (error.message.includes("certificate") || error.message.includes("TLS")) {
      friendlyMessage = "Secure connection failed. Try changing the security settings.";
    } else if (error.message.includes("timeout") || error.message.includes("Failed to upgrade")) {
      friendlyMessage = "Connection timed out. The server took too long to respond.";
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      friendlyMessage = "Server not found. Please check the hostname.";
    }
    
    return {
      success: false,
      message: friendlyMessage,
      error: error.message,
      details: errorDetails
    };
  } finally {
    // Ensure client is closed
    if (client.usable) {
      client.close();
    }
  }
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

    // Configure IMAP client with improved settings
    const settings = imapSettings[0];
    const imapConfig = {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.username,
        pass: settings.password
      },
      logger: false,
      // Add improved TLS configuration
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
        servername: settings.host // Explicitly set servername
      },
      // Add timeout configurations
      connectionTimeout: 30000, // 30 seconds
      greetTimeout: 15000,      // 15 seconds
      socketTimeout: 30000,     // 30 seconds
      disableCompression: false // Keep compression enabled by default
    };

    // Fetch emails
    const result = await fetchEmails(imapConfig, userId, force_refresh);

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
