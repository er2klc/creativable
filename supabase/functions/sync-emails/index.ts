
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';
import { simpleParser } from 'npm:mailparser@3.6.5';
import * as log from 'npm:console';
import { corsHeaders } from "../_shared/cors.ts";

// Enable global debug logging for detailed connection information
const globalDebugMode = true;

// Helper function for better debug logging with timestamps
function debugLog(...args: any[]) {
  if (globalDebugMode) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...args);
  }
}

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
  batchProcessing?: {
    totalBatches: number;
    completedBatches: number;
    emailsPerBatch: number;
  };
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
  tls: {
    rejectUnauthorized: boolean;
    servername?: string;
    enableTrace?: boolean;
    minVersion?: string;
  };
  connectionTimeout: number;
  greetTimeout: number;
  socketTimeout: number;
  disableCompression?: boolean;
  emitLogs?: boolean;
}

interface SyncOptions {
  forceRefresh?: boolean;
  historicalSync?: boolean;
  startDate?: Date;
  maxEmails?: number;
  folder?: string;
  folderSyncOnly?: boolean;
  batchProcessing?: boolean;
  maxBatchSize?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  tlsOptions?: {
    rejectUnauthorized: boolean;
    enableTrace?: boolean;
    minVersion?: string;
  };
  incrementalConnection?: boolean;
  loadLatest?: boolean;
}

// Add this new date validation function
function isDateInFuture(date: Date): boolean {
  const currentDate = new Date();
  return date > currentDate;
}

// Main function to sync emails
async function syncEmails(
  imapSettings: ImapSettings,
  userId: string,
  options: SyncOptions = {},
  retryCount = 0
): Promise<SyncResult> {
  const { 
    folder = 'INBOX', 
    maxEmails = 500, 
    batchProcessing = true,
    maxBatchSize = 25,
    connectionTimeout = 60000,
    retryAttempts = 2,
    loadLatest = true
  } = options;
  
  // Check for system time issues
  const currentTime = new Date();
  if (isDateInFuture(currentTime) && !options.ignoreDataValidation) {
    console.error(`SYSTEM TIME ERROR: System time appears to be in the future: ${currentTime.toISOString()}`);
    return {
      success: false,
      message: "System time error: Your system clock appears to be set to a future date, which can cause authentication failures",
      error: "System time is set to a future date",
      details: `Current system time: ${currentTime.toISOString()}`
    };
  }

  debugLog(`[Attempt ${retryCount + 1}] Syncing emails from folder ${folder} with options:`, options);
  
  // Update status in DB to show sync in progress
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Update or create sync status
    const syncStatusResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/email_sync_status?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );
    
    const existingSyncStatus = await syncStatusResponse.json();
    
    if (existingSyncStatus && existingSyncStatus.length > 0) {
      // Update existing status
      await fetch(
        `${SUPABASE_URL}/rest/v1/email_sync_status?id=eq.${existingSyncStatus[0].id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            last_sync_time: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      );
    } else {
      // Create new status
      await fetch(
        `${SUPABASE_URL}/rest/v1/email_sync_status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userId,
            folder: folder,
            last_sync_time: new Date().toISOString(),
            items_synced: 0
          })
        }
      );
    }
  } catch (statusError) {
    console.error("Error updating sync status:", statusError);
    // Continue with sync even if status update fails
  }
  
  // Create IMAP connection
  const client = new ImapFlow(imapSettings);
  
  try {
    // Create a connection timeout promise
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection timed out after ${connectionTimeout}ms`));
      }, connectionTimeout);
    });
    
    // Race the connection and timeout
    await Promise.race([connectPromise, timeoutPromise]);
    
    debugLog("Successfully connected to IMAP server");
    
    // Select the specified folder
    const mailbox = await client.mailboxOpen(folder);
    debugLog(`Selected folder: ${folder}, message count: ${mailbox.exists}`);
    
    if (mailbox.exists === 0) {
      debugLog(`No messages in folder ${folder}`);
      await client.logout();
      return {
        success: true,
        message: `No messages found in folder ${folder}`,
        emailsCount: 0
      };
    }
    
    // Get existing message IDs for this folder and user
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const existingEmailsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/emails?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}&select=message_id`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        }
      }
    );
    
    const existingEmails = await existingEmailsResponse.json();
    const existingMessageIds = new Set(existingEmails.map(e => e.message_id));
    
    debugLog(`Found ${existingMessageIds.size} existing emails in database for folder ${folder}`);
    
    // Determine sequence numbers to fetch
    // If loadLatest is true, start from the most recent emails
    const totalMessages = mailbox.exists;
    const maxToSync = Math.min(maxEmails, totalMessages);
    
    let sequenceFrom, sequenceTo;
    if (loadLatest) {
      sequenceFrom = Math.max(1, totalMessages - maxToSync + 1);
      sequenceTo = totalMessages;
    } else {
      sequenceFrom = 1;
      sequenceTo = Math.min(maxToSync, totalMessages);
    }
    
    debugLog(`Will sync emails from sequence ${sequenceFrom} to ${sequenceTo} (${sequenceTo - sequenceFrom + 1} total)`);
    
    // Process messages in batches for better performance and progress tracking
    const batchSize = batchProcessing ? maxBatchSize : maxToSync;
    const totalMessages = sequenceTo - sequenceFrom + 1;
    const totalBatches = Math.ceil(totalMessages / batchSize);
    
    debugLog(`Processing in ${totalBatches} batches of ${batchSize} emails`);
    
    let processedEmails = 0;
    let newEmails = 0;
    let emailsToInsert = [];
    
    // Process emails in batches
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const batchStart = sequenceFrom + (batchNum * batchSize);
      const batchEnd = Math.min(sequenceTo, batchStart + batchSize - 1);
      
      debugLog(`Processing batch ${batchNum + 1}/${totalBatches}, messages ${batchStart}-${batchEnd}`);
      
      // Fetch messages in the current batch
      const fetchOptions = {
        uid: true,
        envelope: true,
        bodyStructure: true,
        flags: true,
        headers: true
      };
      
      // Use fetch to get message data
      for await (const message of client.fetch(`${batchStart}:${batchEnd}`, fetchOptions)) {
        try {
          processedEmails++;
          
          // Calculate progress percentage
          const progress = Math.floor((processedEmails / totalMessages) * 100);
          
          // Get message ID and check if it already exists
          const messageId = message.envelope.messageId;
          
          if (existingMessageIds.has(messageId)) {
            debugLog(`Skipping existing message: ${messageId}`);
            // Can update flags and read status if needed
            continue;
          }
          
          // Get full message content
          const messageData = await client.download(message.seq);
          
          if (!messageData) {
            console.error(`Failed to download message content for seq ${message.seq}`);
            continue;
          }
          
          // Parse the message
          const parsed = await simpleParser(messageData.content);
          
          // Extract email components
          const subject = parsed.subject || "(No Subject)";
          const from = parsed.from?.text || "";
          const fromEmail = parsed.from?.value?.[0]?.address || "";
          const fromName = parsed.from?.value?.[0]?.name || fromEmail;
          
          const to = parsed.to?.text || "";
          const toEmail = parsed.to?.value?.[0]?.address || "";
          const toName = parsed.to?.value?.[0]?.name || toEmail;
          
          // Get CC and BCC recipients
          const cc = (parsed.cc?.value || []).map(addr => addr.address);
          const bcc = (parsed.bcc?.value || []).map(addr => addr.address);
          
          // Get sent date
          const sentDate = parsed.date ? new Date(parsed.date) : new Date();
          
          // Check if message has attachments
          const hasAttachments = parsed.attachments && parsed.attachments.length > 0;
          
          // Get message flags
          const flags = message.flags || [];
          
          // Determine if message is read
          const isRead = flags.includes("\\Seen");
          
          // Store the email in the database
          const emailData = {
            user_id: userId,
            folder: folder,
            message_id: messageId,
            subject: subject,
            from_name: fromName,
            from_email: fromEmail,
            to_name: toName,
            to_email: toEmail,
            cc: cc,
            bcc: bcc,
            html_content: parsed.html || null,
            text_content: parsed.text || null,
            sent_at: sentDate.toISOString(),
            received_at: new Date().toISOString(),
            read: isRead,
            starred: flags.includes("\\Flagged"),
            has_attachments: hasAttachments,
            flags: flags
          };
          
          // Add to batch insert array
          emailsToInsert.push(emailData);
          newEmails++;
          
          // Batch insert if we've accumulated enough emails
          if (emailsToInsert.length >= 10) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/emails`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': SUPABASE_SERVICE_ROLE_KEY,
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify(emailsToInsert)
              }
            );
            
            // Clear the batch array
            emailsToInsert = [];
          }
          
          // Store sync progress for tracking
          if (processedEmails % 5 === 0 || processedEmails === totalMessages) {
            // Store progress in Redis
            // This is simplified - you might want to use a more persistent storage for production
            try {
              await fetch(
                `${SUPABASE_URL}/rest/v1/email_sync_status?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    items_synced: processedEmails
                  })
                }
              );
            } catch (progressError) {
              console.error("Error updating progress:", progressError);
            }
          }
        } catch (messageError) {
          console.error(`Error processing message at seq ${message.seq}:`, messageError);
          // Continue with next message despite errors
        }
      }
      
      // Update progress after batch
      debugLog(`Completed batch ${batchNum + 1}/${totalBatches}, processed ${processedEmails}/${totalMessages} emails`);
    }
    
    // Insert any remaining emails
    if (emailsToInsert.length > 0) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/emails`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(emailsToInsert)
        }
      );
    }
    
    // Update folder message counts
    try {
      const folderUpdateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${userId}&path=eq.${encodeURIComponent(folder)}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            total_messages: mailbox.exists,
            unread_messages: mailbox.unseen,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!folderUpdateResponse.ok) {
        console.error("Error updating folder counts:", await folderUpdateResponse.text());
      }
    } catch (folderError) {
      console.error("Exception updating folder counts:", folderError);
    }
    
    // Clean up
    await client.logout();
    
    // Return results
    return {
      success: true,
      message: `Successfully synced ${newEmails} new emails from folder ${folder}`,
      emailsCount: newEmails,
      progress: 100,
      batchProcessing: {
        totalBatches,
        completedBatches: totalBatches,
        emailsPerBatch: batchSize
      }
    };
  } catch (error) {
    console.error("IMAP sync error:", error);
    
    // Try to close the connection if it's still open
    try {
      if (client.usable) {
        await client.logout();
      }
    } catch (logoutError) {
      console.error("Error during logout:", logoutError);
    }
    
    // Retry with different settings if retry count isn't exhausted
    if (retryCount < retryAttempts) {
      console.log(`Retrying email sync (${retryCount + 1}/${retryAttempts})...`);
      
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
          connectionTimeout: imapSettings.connectionTimeout * 1.5 // Increase timeout
        };
        return syncEmails(newSettings, userId, options, retryCount + 1);
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
        return syncEmails(newSettings, userId, options, retryCount + 1);
      }
    }
    
    return {
      success: false,
      message: "Failed to sync emails",
      error: error.message,
      details: error.stack || "Unknown error during email sync"
    };
  }
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log("Request data received:", JSON.stringify(requestData));

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
    
    const imapConfig = {
      host: settings.host,
      port: settings.port || 993,
      secure: settings.secure !== false, // Default to true if not set
      auth: {
        user: settings.username,
        pass: settings.password
      },
      logger: requestData.debug || false,
      tls: {
        rejectUnauthorized: !(requestData.disable_certificate_validation || false),
        servername: settings.host,
        enableTrace: requestData.tlsOptions?.enableTrace || false,
        minVersion: requestData.tlsOptions?.minVersion || 'TLSv1'
      },
      connectionTimeout: requestData.connection_timeout || settings.connection_timeout || 30000,
      greetTimeout: 15000,
      socketTimeout: 30000,
      disableCompression: false
    };

    // Extract sync options from request
    const syncOptions = {
      folder: requestData.folder || 'INBOX',
      forceRefresh: requestData.force_refresh || false,
      maxEmails: requestData.max_emails || settings.max_emails || 500,
      batchProcessing: requestData.batch_processing !== false,
      maxBatchSize: requestData.max_batch_size || 25,
      connectionTimeout: requestData.connection_timeout || settings.connection_timeout || 30000,
      retryAttempts: requestData.retry_attempts || 2,
      folderSyncOnly: requestData.folder_sync_only || false,
      incrementalConnection: requestData.incremental_connection || false,
      loadLatest: requestData.load_latest !== false,
      historicalSync: requestData.historical_sync || settings.historical_sync || false,
      tlsOptions: requestData.tlsOptions || { rejectUnauthorized: false },
      ignoreDataValidation: requestData.ignore_date_validation || false
    };

    // Only sync folders if explicitly requested
    if (syncOptions.folderSyncOnly) {
      console.log("Folder sync only mode - redirecting to folder sync endpoint");
      
      // Call sync-folders endpoint
      const folderSyncResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/sync-folders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
            force_refresh: syncOptions.forceRefresh
          })
        }
      );
      
      if (!folderSyncResponse.ok) {
        throw new Error(`Folder sync failed with status ${folderSyncResponse.status}: ${await folderSyncResponse.text()}`);
      }
      
      return new Response(
        await folderSyncResponse.text(),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          }
        }
      );
    }

    // Sync emails
    const syncResult = await syncEmails(imapConfig, userId, syncOptions);

    return new Response(
      JSON.stringify(syncResult),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Sync emails error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to sync emails",
        error: error.message,
        details: error.stack || "Unknown error"
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
