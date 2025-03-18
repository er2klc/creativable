
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
  hasMoreEmails?: boolean;
  lastSyncedId?: string;
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
  backgroundSync?: boolean;
  lastEmailId?: string;
  skipHistorical?: boolean;
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
        
        // Use a proper UPSERT pattern with ON CONFLICT DO UPDATE
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
          
          // Log the error but continue with other folders
          console.error(`Failed to store folder: ${errorText}`);
          
          // If it's a duplicate key error, try an update instead
          if (errorText.includes('duplicate key value') || errorText.includes('23505')) {
            console.log(`Attempting to update folder ${folder.path} instead of insert...`);
            
            const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${userId}&path=eq.${encodeURIComponent(folder.path)}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
              },
              body: JSON.stringify({
                name: folder.name,
                type: folderType,
                special_use: specialUse,
                flags: folder.flags || [],
                total_messages: mailbox.messages,
                unread_messages: mailbox.unseen,
                updated_at: new Date().toISOString()
              })
            });
            
            if (!updateResponse.ok) {
              console.error(`Failed to update folder: ${await updateResponse.text()}`);
            } else {
              console.log(`Successfully updated folder: ${folder.path}`);
            }
          }
        } else {
          console.log(`Successfully stored folder: ${folder.path}`);
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
  console.log(`Sync options:`, JSON.stringify(options));
  
  const client = new ImapFlow(imapSettings);
  const maxEmails = options.maxEmails || (options.forceRefresh ? 100 : 20);
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
    
    // If there are no emails in the mailbox, return early
    if (mailbox.exists === 0) {
      await client.logout();
      return {
        success: true,
        message: "No emails found in mailbox",
        emailsCount: 0,
        hasMoreEmails: false,
        progress: 100
      };
    }
    
    // Determine fetch options based on sync type
    let fetchOptions;
    let fetchCount = Math.min(maxEmails, mailbox.exists);
    let hasMoreEmails = mailbox.exists > fetchCount;
    
    // Check if this is a background sync continuing from a previous sync
    if (options.backgroundSync && options.lastEmailId) {
      console.log(`Background sync requested with last email ID: ${options.lastEmailId}`);
      
      // Try to find existing email in database to determine starting point
      const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
      const emailResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/emails?id=eq.${options.lastEmailId}&select=message_id`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          }
        }
      );
      
      if (!emailResponse.ok) {
        console.error("Failed to fetch reference email:", await emailResponse.text());
        throw new Error("Failed to find reference email for background sync");
      }
      
      const emailData = await emailResponse.json();
      if (!emailData || emailData.length === 0) {
        console.error("Reference email not found");
        throw new Error("Reference email not found for background sync");
      }
      
      // Get existing emails to determine what we've already synced
      const existingEmailsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/emails?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}&select=id,message_id&order=sent_at.desc`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          }
        }
      );
      
      if (!existingEmailsResponse.ok) {
        console.error("Failed to fetch existing emails:", await existingEmailsResponse.text());
        throw new Error("Failed to fetch existing emails for background sync");
      }
      
      const existingEmails = await existingEmailsResponse.json();
      console.log(`Found ${existingEmails.length} existing emails in database for this folder`);
      
      // Search for all messages in the mailbox
      console.log("Finding all message IDs in mailbox to determine fetch range");
      const messages = [];
      for await (const message of client.fetch({ seq: `1:*` }, { uid: true, envelope: true })) {
        messages.push({ seq: message.seq, uid: message.uid, id: message.envelope.messageId });
      }
      console.log(`Found ${messages.length} messages in mailbox`);
      
      // Sort by sequence number descending (newest first)
      messages.sort((a, b) => b.seq - a.seq);
      
      // Find already synced messages
      const syncedMessageIds = new Set(existingEmails.map(e => e.message_id));
      
      // Filter out messages we already have
      const unSyncedMessages = messages.filter(m => !syncedMessageIds.has(m.id));
      console.log(`Found ${unSyncedMessages.length} unsynchronized messages`);
      
      if (unSyncedMessages.length === 0) {
        await client.logout();
        return {
          success: true,
          message: "All emails already synchronized",
          emailsCount: 0,
          hasMoreEmails: false,
          progress: 100
        };
      }
      
      // Take the next batch of messages
      const batchSize = Math.min(maxEmails, unSyncedMessages.length);
      const messagesToFetch = unSyncedMessages.slice(0, batchSize);
      
      // Create a seq range for the messages to fetch
      if (messagesToFetch.length > 0) {
        const seqNumbers = messagesToFetch.map(m => m.seq);
        const minSeq = Math.min(...seqNumbers);
        const maxSeq = Math.max(...seqNumbers);
        fetchOptions = {
          seq: `${minSeq}:${maxSeq}`,
          envelope: true,
          bodyStructure: true,
          source: true
        };
        fetchCount = messagesToFetch.length;
        hasMoreEmails = unSyncedMessages.length > messagesToFetch.length;
      } else {
        // If no messages to fetch, return success
        await client.logout();
        return {
          success: true,
          message: "No new emails to synchronize",
          emailsCount: 0,
          hasMoreEmails: false,
          progress: 100
        };
      }
    } else {
      // For initial sync, always get the most recent emails first (ignore historical sync date)
      console.log(`Initial sync requesting ${fetchCount} emails from ${mailbox.exists} total`);
      
      // Get the most recent emails, using sequence numbers
      fetchOptions = {
        seq: `${Math.max(1, mailbox.exists - fetchCount + 1)}:${mailbox.exists}`,
        envelope: true,
        bodyStructure: true,
        source: true
      };
    }
    
    console.log(`Fetch options:`, JSON.stringify(fetchOptions));
    
    const emails = [];
    let counter = 0;
    let lastSyncedId = null;
    
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
          // Get the ID of the inserted/updated email
          const result = await response.json();
          counter++;
          
          // Store the inserted ID as the last synced ID
          if (result && result.length > 0 && result[0].id) {
            lastSyncedId = result[0].id;
          } else {
            // If we can't get the ID from the response, query for it
            const emailQuery = await fetch(
              `${SUPABASE_URL}/rest/v1/emails?message_id=eq.${encodeURIComponent(parsedEmail.message_id)}&user_id=eq.${userId}&select=id`,
              {
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': SUPABASE_SERVICE_ROLE_KEY,
                }
              }
            );
            
            if (emailQuery.ok) {
              const emailData = await emailQuery.json();
              if (emailData.length > 0) {
                lastSyncedId = emailData[0].id;
              }
            }
          }
          
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
      
      // Update last sync tracking record
      await fetch(`${SUPABASE_URL}/rest/v1/email_sync_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          user_id: userId,
          folder: folder,
          last_sync_time: new Date().toISOString(),
          items_synced: counter
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
      progress: 100,
      hasMoreEmails: hasMoreEmails,
      lastSyncedId: lastSyncedId
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
      folder = 'INBOX',
      background_sync = false,
      last_email_id = null,
      skip_historical = false
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
        
        // Update the setting in the database
        await fetch(`${SUPABASE_URL}/rest/v1/imap_settings?id=eq.${settings.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            historical_sync_date: now.toISOString()
          })
        });
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
      folder: folder,
      backgroundSync: background_sync,
      lastEmailId: last_email_id,
      skipHistorical: skip_historical
    };
    
    // Handle historical sync - but only if not explicitly skipped
    if (!skip_historical && (historical_sync || settings.historical_sync)) {
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
    
    // Update last sync time
    await fetch(`${SUPABASE_URL}/rest/v1/imap_settings?id=eq.${settings.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        last_sync_date: new Date().toISOString()
      })
    });
    
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
