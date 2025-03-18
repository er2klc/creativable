import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';
import { simpleParser } from 'npm:mailparser@3.6.5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface SyncResult {
  success: boolean;
  message: string;
  emailsCount?: number;
  folderCount?: number;
  error?: string;
  details?: string;
  progress?: number;
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

interface SyncOptions {
  forceRefresh?: boolean;
  historicalSync?: boolean;
  startDate?: Date;
  maxEmails?: number;
  folder?: string;
}

async function syncEmailFolders(
  imapSettings: ImapSettings,
  userId: string,
  retryCount = 0
): Promise<SyncResult> {
  console.log(`[Attempt ${retryCount + 1}] Getting email folders from: ${imapSettings.host}:${imapSettings.port}`);
  
  const client = new ImapFlow(imapSettings);
  
  try {
    await client.connect();
    console.log("Successfully connected to IMAP server for folder synchronization");
    
    const folderList = await client.list();
    console.log(`Found ${folderList.length} folders`);
    
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Group folders by type
    const specialFolders = {
      inbox: null,
      sent: null,
      drafts: null,
      trash: null,
      spam: null,
      archive: null,
    };
    
    // Try to identify special folders
    for (const folder of folderList) {
      if (folder.specialUse) {
        if (folder.specialUse === '\\Inbox') specialFolders.inbox = folder;
        if (folder.specialUse === '\\Sent') specialFolders.sent = folder;
        if (folder.specialUse === '\\Drafts') specialFolders.drafts = folder;
        if (folder.specialUse === '\\Trash') specialFolders.trash = folder;
        if (folder.specialUse === '\\Junk') specialFolders.spam = folder;
        if (folder.specialUse === '\\Archive') specialFolders.archive = folder;
      } else {
        // Try to identify by common folder names
        const folderName = folder.name.toLowerCase();
        if (folderName.includes('inbox') && !specialFolders.inbox) specialFolders.inbox = folder;
        if ((folderName.includes('sent') || folderName.includes('gesend')) && !specialFolders.sent) specialFolders.sent = folder;
        if ((folderName.includes('draft') || folderName.includes('entwu')) && !specialFolders.drafts) specialFolders.drafts = folder;
        if ((folderName.includes('trash') || folderName.includes('papier') || folderName.includes('müll')) && !specialFolders.trash) specialFolders.trash = folder;
        if ((folderName.includes('spam') || folderName.includes('junk')) && !specialFolders.spam) specialFolders.spam = folder;
        if (folderName.includes('archiv') && !specialFolders.archive) specialFolders.archive = folder;
      }
    }
    
    // Create folder entries in the database - use proper UPSERT pattern
    for (const folder of folderList) {
      let folderType = 'regular';
      let specialUse = null;
      
      // Check if this is a special folder
      if (folder === specialFolders.inbox) {
        folderType = 'inbox';
        specialUse = '\\Inbox';
      } else if (folder === specialFolders.sent) {
        folderType = 'sent';
        specialUse = '\\Sent';
      } else if (folder === specialFolders.drafts) {
        folderType = 'drafts';
        specialUse = '\\Drafts';
      } else if (folder === specialFolders.trash) {
        folderType = 'trash';
        specialUse = '\\Trash';
      } else if (folder === specialFolders.spam) {
        folderType = 'spam';
        specialUse = '\\Junk';
      } else if (folder === specialFolders.archive) {
        folderType = 'archive';
        specialUse = '\\Archive';
      } else if (folder.specialUse) {
        specialUse = folder.specialUse;
      }
      
      try {
        const mailbox = await client.status(folder.path, { messages: true, unseen: true });
        
        // Store folder in database with a proper UPSERT pattern
        const response = await fetch(`${SUPABASE_URL}/rest/v1/email_folders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            user_id: userId,
            name: folder.name,
            path: folder.path,
            type: folderType,
            special_use: specialUse,
            flags: folder.flags || [],
            total_messages: mailbox.messages,
            unread_messages: mailbox.unseen,
            updated_at: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to store folder: ${errorText}`);
        }
      } catch (folderError) {
        console.error(`Error processing folder ${folder.path}:`, folderError);
      }
    }
    
    await client.logout();
    
    return {
      success: true,
      message: `Successfully synced ${folderList.length} email folders`,
      folderCount: folderList.length
    };
  } catch (error) {
    console.error("IMAP folder sync error:", error);
    
    if (retryCount < 1) {
      console.log(`Retrying folder sync (${retryCount + 1}/1)...`);
      const newSettings = {
        ...imapSettings,
        secure: !imapSettings.secure,
        port: imapSettings.secure ? 143 : 993,
        tls: {
          ...imapSettings.tls,
          rejectUnauthorized: false
        }
      };
      return syncEmailFolders(newSettings, userId, retryCount + 1);
    }
    
    return {
      success: false,
      message: "Failed to sync email folders",
      error: error.message,
      details: error.stack || "Unknown error during folder sync"
    };
  } finally {
    if (client.usable) {
      client.close();
    }
  }
}

async function fetchEmails(
  imapSettings: ImapSettings, 
  userId: string, 
  options: SyncOptions = {}, 
  retryCount = 0
): Promise<SyncResult> {
  console.log(`[Attempt ${retryCount + 1}] Connecting to IMAP server: ${imapSettings.host}:${imapSettings.port} (secure: ${imapSettings.secure})`);
  
  const client = new ImapFlow(imapSettings);
  const maxEmails = options.maxEmails || (options.forceRefresh ? 20 : 10);
  const folder = options.folder || 'INBOX';
  
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
    const mailbox = await client.mailboxOpen(folder);
    console.log(`Mailbox opened with ${mailbox.exists} messages`);
    
    // Determine how many emails to fetch
    let fetchCount = Math.min(maxEmails, mailbox.exists);
    
    if (fetchCount === 0) {
      return {
        success: true,
        message: "No emails found in mailbox",
        emailsCount: 0,
        progress: 100
      };
    }
    
    // Prepare fetch options - handling historical sync if requested
    let fetchOptions;
    
    if (options.historicalSync && options.startDate) {
      console.log(`Historical sync requested from date: ${options.startDate.toISOString()}`);
      
      // Ensure startDate is not in the future
      const now = new Date();
      if (options.startDate > now) {
        console.warn("Historical sync date was in the future, resetting to today's date");
        options.startDate = now;
      }
      
      fetchOptions = {
        since: options.startDate,
        envelope: true,
        bodyStructure: true,
        source: true
      };
    } else {
      // Get the most recent emails, using sequence numbers
      fetchOptions = {
        seq: `${Math.max(1, mailbox.exists - fetchCount + 1)}:${mailbox.exists}`,
        envelope: true,
        bodyStructure: true,
        source: true
      };
    }
    
    const emails = [];
    let counter = 0;
    
    // Fetch messages
    for await (const message of client.fetch(fetchOptions)) {
      console.log(`Processing message #${message.seq}`);
      
      // Report progress
      const progress = Math.floor((counter / fetchCount) * 100);
      if (counter % 5 === 0) {
        console.log(`Sync progress: ${progress}%`);
      }
      
      try {
        // Parse email with mailparser
        const parsed = await simpleParser(message.source);
        
        // Extract email data
        const parsedEmail = {
          message_id: message.envelope.messageId,
          folder: folder,
          subject: parsed.subject || "(No Subject)",
          from_name: parsed.from?.value[0]?.name || "",
          from_email: parsed.from?.value[0]?.address || "",
          to_name: parsed.to?.value[0]?.name || "",
          to_email: parsed.to?.value[0]?.address || "",
          cc: parsed.cc?.value.map(addr => addr.address) || [],
          bcc: parsed.bcc?.value.map(addr => addr.address) || [],
          content: message.source.toString(),
          html_content: parsed.html || null,
          text_content: parsed.text || null,
          sent_at: parsed.date || message.envelope.date,
          received_at: new Date(),
          user_id: userId,
          read: message.flags.includes("\\Seen"),
          starred: message.flags.includes("\\Flagged"),
          has_attachments: parsed.attachments && parsed.attachments.length > 0,
          flags: message.flags,
          headers: Object.fromEntries(
            Object.entries(parsed.headers).map(([key, value]) => {
              // Handle array headers
              if (Array.isArray(value)) {
                return [key, value];
              }
              // Convert Map to object if needed
              if (value instanceof Map) {
                return [key, Object.fromEntries(value)];
              }
              return [key, value];
            })
          )
        };
        
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
          body: JSON.stringify(parsedEmail)
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
      
      // Limit the number of emails processed
      if (counter >= maxEmails) {
        console.log(`Reached maximum email count (${maxEmails}), stopping fetch`);
        break;
      }
    }
    
    // Update the unread count for the folder
    try {
      const mailboxStatus = await client.status(folder, { unseen: true });
      const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
      
      await fetch(`${SUPABASE_URL}/rest/v1/email_folders?path=eq.${encodeURIComponent(folder)}&user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          unread_messages: mailboxStatus.unseen,
          total_messages: mailboxStatus.messages,
          updated_at: new Date().toISOString()
        })
      });
    } catch (statusError) {
      console.error("Error updating folder status:", statusError);
    }
    
    await client.logout();
    console.log(`Successfully fetched ${counter} emails`);
    
    return {
      success: true,
      message: `Successfully synced ${counter} emails`,
      emailsCount: counter,
      progress: 100
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
        return fetchEmails(newSettings, userId, options, retryCount + 1);
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
        return fetchEmails(newSettings, userId, options, retryCount + 1);
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
      details: errorDetails,
      progress: 0
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

    const { 
      force_refresh = false,
      historical_sync = false,
      sync_start_date = null,
      max_emails = 100,
      folder = 'INBOX'
    } = requestData;

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
    
    // Validate historical_sync_date if present
    if (settings.historical_sync && settings.historical_sync_date) {
      const historicalDate = new Date(settings.historical_sync_date);
      const now = new Date();
      
      // If the date is in the future, reset it to today
      if (historicalDate > now) {
        console.warn("Historical sync date was in the future, resetting to today's date");
        settings.historical_sync_date = now.toISOString();
      }
    }
    
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

    // First sync folders if force refresh or it's a periodic sync
    let folderResult = { success: true };
    if (force_refresh || !requestData.folder) {
      folderResult = await syncEmailFolders(imapConfig, userId);
      
      if (!folderResult.success) {
        return new Response(JSON.stringify(folderResult), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
          status: 200, // Return 200 even on error to get the error details on frontend
        });
      }
    }

    // Prepare sync options
    const syncOptions: SyncOptions = {
      forceRefresh: force_refresh,
      maxEmails: max_emails || settings.max_emails || 100,
      folder: folder
    };
    
    // Handle historical sync - validate the date first
    if (historical_sync || settings.historical_sync) {
      syncOptions.historicalSync = true;
      
      // Get start date from request or from settings
      let startDateStr = sync_start_date || settings.historical_sync_date;
      if (startDateStr) {
        let startDate = new Date(startDateStr);
        const now = new Date();
        
        // Ensure the date is not in the future
        if (startDate > now) {
          console.warn("Historical sync date was in the future, resetting to today's date");
          startDate = now;
        }
        
        syncOptions.startDate = startDate;
        console.log(`Historical sync enabled with start date: ${syncOptions.startDate}`);
      } else {
        // Default to 30 days ago if no date specified
        syncOptions.startDate = new Date();
        syncOptions.startDate.setDate(syncOptions.startDate.getDate() - 30);
        console.log(`Historical sync enabled with default start date: ${syncOptions.startDate}`);
      }
    }

    // Fetch emails
    const emailResult = await fetchEmails(imapConfig, userId, syncOptions);
    
    // Combine results
    const result = {
      ...emailResult,
      folderCount: folderResult.folderCount
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
    
    const result = {
      success: false,
      message: "Failed to sync emails",
      error: error.message,
      progress: 0
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
