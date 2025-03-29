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
  incrementalSync?: boolean;
  ignoreDataValidation?: boolean;
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
    maxEmails = 100, 
    batchProcessing = true,
    maxBatchSize = 10,
    connectionTimeout = 30000,
    retryAttempts = 2,
    loadLatest = true,
    incrementalSync = true,
    ignoreDataValidation = false
  } = options;
  
  // Check for system time issues
  const currentTime = new Date();
  if (isDateInFuture(currentTime) && !ignoreDataValidation) {
    console.error(`SYSTEM TIME ERROR: System time appears to be in the future: ${currentTime.toISOString()}`);
    return {
      success: false,
      message: "System time error: Your system clock appears to be set to a future date, which can cause authentication failures",
      error: "System time is set to a future date",
      details: `Current system time: ${currentTime.toISOString()}`
    };
  }

  debugLog(`[Attempt ${retryCount + 1}] Syncing emails from folder ${folder} with options:`, options);
  
  // Get the SUPABASE environment variables
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }
  
  // First check if we have a previous sync record and when it was last synced
  let lastSyncTime: Date | null = null;
  let lastUID: number | null = null;
  
  if (incrementalSync && !options.forceRefresh) {
    try {
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
      
      const syncStatus = await syncStatusResponse.json();
      
      if (syncStatus && syncStatus.length > 0) {
        lastSyncTime = new Date(syncStatus[0].last_sync_time);
        lastUID = syncStatus[0].last_uid || null;
        debugLog(`Found previous sync record. Last sync time: ${lastSyncTime.toISOString()}, Last UID: ${lastUID}`);
      }
    } catch (error) {
      console.error("Error fetching sync status:", error);
      // Continue with sync even if we can't get the last sync time
    }
  }
  
  // Update status in DB to show sync in progress
  try {
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
            sync_in_progress: true,
            last_sync_attempt: new Date().toISOString(),
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
            last_sync_attempt: new Date().toISOString(),
            items_synced: 0,
            sync_in_progress: true
          })
        }
      );
    }
  } catch (statusError) {
    console.error("Error updating sync status:", statusError);
    // Continue with sync even if status update fails
  }

  // Create IMAP connection with optimized settings
  const optimizedSettings = {
    ...imapSettings,
    connectionTimeout: 30000,
    greetTimeout: 15000,
    socketTimeout: 30000,
    disableCompression: true, // Try disabling compression for better performance
    tls: {
      ...imapSettings.tls,
      rejectUnauthorized: false, // More permissive TLS for broader compatibility
      minVersion: 'TLSv1'
    }
  };

  const client = new ImapFlow(optimizedSettings);
  
  try {
    debugLog("Attempting to connect to IMAP server...");
    
    // Create a connection timeout promise
    const connectPromise = client.connect();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection timed out after ${connectionTimeout}ms`));
      }, connectionTimeout);
    });
    
    // Verbesserte Fehlerbehandlung bei Verbindung
    try {
      // Race connection attempt vs. timeout
      await Promise.race([connectPromise, timeoutPromise]);
      debugLog("Successfully connected to IMAP server");
    } catch (connectionError) {
      debugLog(`Connection error (attempt ${retryCount + 1}): ${connectionError.message}`);
      
      // Sofort einen Retry mit alternativen Einstellungen versuchen
      if (retryCount < retryAttempts) {
        debugLog(`Immediate retry with alternative settings...`);
        
        // Definiere eine Liste von alternativen Konfigurationen für unterschiedliche Szenarien
        const retryConfigs = [
          // 1. Standard-Port mit deaktiviertem TLS
          {
            ...imapSettings,
            secure: false,
            port: 143, // Non-secure IMAP port
            tls: {
              rejectUnauthorized: false,
              minVersion: '',
              enableTrace: true
            },
            connectionTimeout: connectionTimeout * 1.5,
            requireTLS: false
          },
          // 2. Alternative Ports für sichere Verbindung, falls Standard-Port blockiert wird
          {
            ...imapSettings,
            secure: true,
            port: 993, // Standard-IMAPS Port erneut versuchen mit anderen Einstellungen
            tls: {
              rejectUnauthorized: false,
              minVersion: '',
              ciphers: 'ALL'
            },
            connectionTimeout: connectionTimeout * 2,
            requireTLS: false,
            greetTimeout: 90000
          },
          // 3. Unverschlüsselte Verbindung als letzte Möglichkeit
          {
            ...imapSettings,
            secure: false,
            port: 143, // Non-secure IMAP port
            tls: { 
              rejectUnauthorized: false,
              minVersion: '',
              ciphers: 'ALL',
              secureContext: false
            }, // Minimales TLS-Objekt statt null
            connectionTimeout: connectionTimeout * 2,
            requireTLS: false
          }
        ];
        
        // Wähle die Konfiguration basierend auf dem aktuellen Versuch
        const alternativeConfig = retryConfigs[Math.min(retryCount, retryConfigs.length - 1)];
        debugLog(`Trying alternative config: secure=${alternativeConfig.secure}, port=${alternativeConfig.port}`);
        
        return syncEmails(alternativeConfig, userId, options, retryCount + 1);
      }
      
      throw connectionError; // Weitergeben, wenn keine Retries mehr möglich
    }
    
    // Select the specified folder
    const mailbox = await client.mailboxOpen(folder);
    debugLog(`Selected folder: ${folder}, message count: ${mailbox.exists}`);
    
    if (mailbox.exists === 0) {
      debugLog(`No messages in folder ${folder}`);
      await client.logout();
      
      // Update sync status
      await updateSyncStatus(userId, folder, 0, null, 0, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      return {
        success: true,
        message: `No messages found in folder ${folder}`,
        emailsCount: 0
      };
    }
    
    // Get existing message IDs for this folder and user
    const existingEmailsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/emails?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}&select=message_id,uid`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        }
      }
    );
    
    // Fix for the "existingEmails.map is not function" error
    let existingData;
    try {
      existingData = await existingEmailsResponse.json();
    } catch (e) {
      existingData = [];
      debugLog("Error parsing existing emails:", e);
    }
    
    // TEMPORÄRER FIX: Wenn forceRefresh aktiviert ist, ignorieren wir vorhandene Emails
    let existingMessageIds = new Set();
    let existingUIDs = new Set();
    
    // Ensure existingData is an array and handle accordingly
    if (Array.isArray(existingData) && !options.forceRefresh) {
      existingMessageIds = new Set(existingData.map(e => e.message_id).filter(Boolean));
      existingUIDs = new Set(existingData.map(e => e.uid).filter(Boolean));
      debugLog(`Found ${existingMessageIds.size} existing emails in database for folder ${folder}`);
    } else {
      if (options.forceRefresh) {
        debugLog(`Force refresh enabled - ignoring ${existingData.length} existing emails for folder ${folder}`);
      } else {
        debugLog(`No existing emails found or invalid response format for folder ${folder}`);
      }
      existingData = [];
      existingMessageIds.clear();
      existingUIDs.clear();
    }
    
    // Determine if we should do incremental sync
    let searchCriteria: any;
    let highestUID = 0;
    
    if (incrementalSync && lastUID && !options.forceRefresh) {
      // Search for messages with UIDs greater than the last one we synced
      searchCriteria = { uid: { gt: lastUID } };
      debugLog(`Performing incremental sync from UID ${lastUID + 1}`);
    } else if (incrementalSync && lastSyncTime && !options.forceRefresh) {
      // Search for messages newer than last sync time
      const sinceDate = new Date(lastSyncTime);
      searchCriteria = { since: sinceDate };
      debugLog(`Performing incremental sync since ${sinceDate.toISOString()}`);
    } else {
      // Full sync - get all messages with the specified limit
      searchCriteria = {}; 
      debugLog(`Performing full sync with max ${maxEmails} emails`);
    }
    
    // Get message sequence numbers using search
    debugLog(`Searching with criteria:`, searchCriteria);
    const messages = await client.search(searchCriteria, { uid: true });
    
    // Sort UIDs in ascending order
    messages.sort((a, b) => a - b);
    
    let messagesToFetch = messages;
    
    // If this is not an incremental sync or a forced refresh, limit the number of messages
    if ((!incrementalSync || !lastUID) && !options.forceRefresh) {
      if (loadLatest) {
        // Get the most recent messages up to maxEmails
        messagesToFetch = messages.slice(-maxEmails);
      } else {
        // Get the oldest messages up to maxEmails
        messagesToFetch = messages.slice(0, maxEmails);
      }
    }
    
    const totalEmails = messagesToFetch.length;
    debugLog(`Found ${totalEmails} messages to fetch`);
    
    if (totalEmails === 0) {
      debugLog(`No new messages to fetch in folder ${folder}`);
      await client.logout();
      
      // Update sync status with current time but don't change last_uid
      await updateSyncStatus(userId, folder, 0, null, 0, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      return {
        success: true,
        message: `No new messages found in folder ${folder}`,
        emailsCount: 0
      };
    }
    
    // Process messages in batches for better performance and progress tracking
    const batchSize = batchProcessing ? maxBatchSize : totalEmails;
    const totalBatches = Math.ceil(totalEmails / batchSize);
    
    debugLog(`Processing in ${totalBatches} batches of ${batchSize} emails`);
    
    let processedEmails = 0;
    let newEmails = 0;
    let emailsToInsert = [];
    let highestProcessedUID = lastUID || 0;
    
    // Process emails in batches
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const batchStart = batchNum * batchSize;
      const batchEnd = Math.min(totalEmails, batchStart + batchSize);
      const batchUIDs = messagesToFetch.slice(batchStart, batchEnd);
      
      if (batchUIDs.length === 0) {
        continue;
      }
      
      debugLog(`Processing batch ${batchNum + 1}/${totalBatches}, messages ${batchStart}-${batchEnd-1}, UIDs: ${batchUIDs[0]}-${batchUIDs[batchUIDs.length-1]}`);
      
      // Fetch messages in the current batch
      const fetchOptions = {
        uid: true,
        envelope: true,
        bodyStructure: true,
        flags: true,
        headers: true
      };
      
      // Use fetch to get message data
      for await (const message of client.fetch(batchUIDs, fetchOptions)) {
        try {
          processedEmails++;
          
          // Keep track of highest UID for incremental sync
          if (message.uid > highestProcessedUID) {
            highestProcessedUID = message.uid;
          }
          
          // Calculate progress percentage
          const progress = Math.floor((processedEmails / totalEmails) * 100);
          
          // Get message ID and check if it already exists
          const messageId = message.envelope.messageId;
          
          if (existingMessageIds.has(messageId) || existingUIDs.has(message.uid)) {
            debugLog(`Skipping existing message: ${messageId} (UID: ${message.uid})`);
            // Can update flags and read status if needed
            continue;
          }
          
          // Debugging für existingMessageIds und existingUIDs
          debugLog(`Checking message: ${messageId} (UID: ${message.uid})`);
          debugLog(`Existing Message IDs count: ${existingMessageIds.size}`);
          debugLog(`Existing UIDs count: ${existingUIDs.size}`);
          debugLog(`Is duplicate by Message ID: ${existingMessageIds.has(messageId)}`);
          debugLog(`Is duplicate by UID: ${existingUIDs.has(message.uid)}`);
          
          // Get full message content
          const messageData = await client.download(message.uid);
          
          if (!messageData) {
            console.error(`Failed to download message content for UID ${message.uid}`);
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
          
          // Try to find a matching lead
          let leadId: string | null = null;
          
          try {
            // Look for leads with matching email addresses
            const leadResponse = await fetch(
              `${SUPABASE_URL}/rest/v1/leads?select=id&or=(email.eq.${encodeURIComponent(fromEmail)},email.eq.${encodeURIComponent(toEmail)})&limit=1`,
              {
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': SUPABASE_SERVICE_ROLE_KEY,
                }
              }
            );
            
            const leads = await leadResponse.json();
            
            if (Array.isArray(leads) && leads.length > 0) {
              leadId = leads[0].id;
              debugLog(`Found matching lead: ${leadId} for email: ${messageId}`);
            }
          } catch (leadError) {
            console.error("Error finding matching lead:", leadError);
            // Continue without lead association
          }
          
          // Store the email in the database
          const emailData = {
            user_id: userId,
            folder: folder,
            message_id: messageId,
            uid: message.uid,
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
            lead_id: leadId, // Associate with lead if found
            starred: flags.includes("\\Flagged"),
            has_attachments: hasAttachments,
            flags: flags
          };
          
          // Add to batch insert array
          emailsToInsert.push(emailData);
          newEmails++;
          
          // Batch insert if we've accumulated enough emails
          if (emailsToInsert.length >= 10) {
            try {
              const response = await fetch(
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
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error inserting emails: ${response.status} ${errorText}`);
              } else {
                // Verarbeite Anhänge für jede eingefügte E-Mail
                const insertedEmails = await response.json();
                
                for (let i = 0; i < insertedEmails.length; i++) {
                  const insertedEmail = insertedEmails[i];
                  const emailDataWithAttachments = emailsToInsert[i];
                  
                  // Prüfe, ob diese E-Mail Anhänge hat
                  const indexInBatch = emailsToInsert.indexOf(emailDataWithAttachments);
                  const messageWithAttachments = indexInBatch >= 0 ? parsed : null;
                  
                  // Wenn die E-Mail Anhänge hat, speichere diese in der email_attachments Tabelle
                  if (messageWithAttachments && messageWithAttachments.attachments && messageWithAttachments.attachments.length > 0) {
                    debugLog(`Processing ${messageWithAttachments.attachments.length} attachments for email ${insertedEmail.id}`);
                    
                    for (const attachment of messageWithAttachments.attachments) {
                      try {
                        // Bereite Attachment-Daten vor
                        const attachmentData = {
                          email_id: insertedEmail.id,
                          file_name: attachment.filename || 'unnamed_attachment',
                          file_type: attachment.contentType || 'application/octet-stream',
                          file_size: attachment.size || 0,
                          file_content: attachment.content ? attachment.content.toString('base64') : null,
                          content_id: attachment.contentId || null
                        };
                        
                        // Füge den Anhang in die Datenbank ein
                        const attachmentResponse = await fetch(
                          `${SUPABASE_URL}/rest/v1/email_attachments`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                              'apikey': SUPABASE_SERVICE_ROLE_KEY,
                              'Prefer': 'return=representation'
                            },
                            body: JSON.stringify(attachmentData)
                          }
                        );
                        
                        if (!attachmentResponse.ok) {
                          const errorText = await attachmentResponse.text();
                          console.error(`Error saving attachment: ${attachmentResponse.status} ${errorText}`);
                        } else {
                          debugLog(`Successfully saved attachment ${attachment.filename} for email ${insertedEmail.id}`);
                        }
                      } catch (attachmentError) {
                        console.error(`Error processing attachment for email ${insertedEmail.id}:`, attachmentError);
                      }
                    }
                  }
                }
              }
            } catch (insertError) {
              console.error("Error inserting batch of emails:", insertError);
            }
            
            // Clear the batch array
            emailsToInsert = [];
          }
          
          // Update sync progress periodically
          if (processedEmails % 5 === 0 || processedEmails === totalEmails) {
            try {
              await updateSyncStatus(
                userId, 
                folder, 
                processedEmails, 
                highestProcessedUID, 
                totalEmails, 
                SUPABASE_URL, 
                SUPABASE_SERVICE_ROLE_KEY
              );
            } catch (progressError) {
              console.error("Error updating progress:", progressError);
            }
          }
        } catch (messageError) {
          console.error(`Error processing message at UID ${message.uid}:`, messageError);
          // Continue with next message despite errors
        }
      }
      
      // Update progress after batch
      debugLog(`Completed batch ${batchNum + 1}/${totalBatches}, processed ${processedEmails}/${totalEmails} emails`);
    }
    
    // Insert any remaining emails
    if (emailsToInsert.length > 0) {
      try {
        const response = await fetch(
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
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error inserting remaining emails: ${response.status} ${errorText}`);
        } else {
          // Verarbeite Anhänge für die verbleibenden eingefügten E-Mails
          const insertedEmails = await response.json();
          
          // Wir müssen jede E-Mail im Batch mit den Anhängen verknüpfen
          for (let i = 0; i < insertedEmails.length; i++) {
            const insertedEmail = insertedEmails[i];
            const emailData = emailsToInsert[i];
            
            // Wenn diese E-Mail Anhänge hat
            if (emailData.has_attachments) {
              debugLog(`Processing attachments for remaining email ${insertedEmail.id}`);
              
              // Lade die E-Mail neu, um die Anhänge zu bekommen
              const messageUID = emailData.uid;
              const messageData = await client.download(messageUID);
              
              if (!messageData) {
                console.error(`Failed to download message content for UID ${messageUID}`);
                continue;
              }
              
              // Parse die Nachricht, um an die Anhänge zu kommen
              const parsedMsg = await simpleParser(messageData.content);
              
              if (parsedMsg.attachments && parsedMsg.attachments.length > 0) {
                for (const attachment of parsedMsg.attachments) {
                  try {
                    // Bereite Attachment-Daten vor
                    const attachmentData = {
                      email_id: insertedEmail.id,
                      file_name: attachment.filename || 'unnamed_attachment',
                      file_type: attachment.contentType || 'application/octet-stream',
                      file_size: attachment.size || 0,
                      file_content: attachment.content ? attachment.content.toString('base64') : null,
                      content_id: attachment.contentId || null
                    };
                    
                    // Füge den Anhang in die Datenbank ein
                    const attachmentResponse = await fetch(
                      `${SUPABASE_URL}/rest/v1/email_attachments`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                          'apikey': SUPABASE_SERVICE_ROLE_KEY,
                          'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(attachmentData)
                      }
                    );
                    
                    if (!attachmentResponse.ok) {
                      const errorText = await attachmentResponse.text();
                      console.error(`Error saving remaining attachment: ${attachmentResponse.status} ${errorText}`);
                    } else {
                      debugLog(`Successfully saved attachment ${attachment.filename} for email ${insertedEmail.id}`);
                    }
                  } catch (attachmentError) {
                    console.error(`Error processing attachment for email ${insertedEmail.id}:`, attachmentError);
                  }
                }
              }
            }
          }
        }
      } catch (insertError) {
        console.error("Error inserting final batch of emails:", insertError);
      }
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
    
    // Update final sync status
    await updateSyncStatus(
      userId, 
      folder, 
      processedEmails, 
      highestProcessedUID, 
      totalEmails, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY, 
      false
    );
    
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
    
    // Update sync status to show error
    try {
      await updateSyncStatus(
        userId, 
        folder, 
        0, 
        null, 
        0, 
        SUPABASE_URL, 
        SUPABASE_SERVICE_ROLE_KEY, 
        false, 
        error.message
      );
    } catch (statusError) {
      console.error("Error updating sync status after error:", statusError);
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
          connectionTimeout: imapSettings.connectionTimeout * 1.5, // Increase timeout
          socketTimeout: 60000, // Longer socket timeout
          greetTimeout: 30000 // Longer greeting timeout
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

// Helper function to update sync status
async function updateSyncStatus(
  userId: string, 
  folder: string, 
  itemsSynced: number, 
  lastUID: number | null, 
  totalItems: number, 
  supabaseUrl: string, 
  supabaseKey: string, 
  inProgress: boolean = true,
  errorMessage: string | null = null
) {
  try {
    // First check if entry exists
    const response = await fetch(
      `${supabaseUrl}/rest/v1/email_sync_status?user_id=eq.${userId}&folder=eq.${encodeURIComponent(folder)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const existingStatus = await response.json();
    
    const updateData: any = {
      items_synced: itemsSynced,
      total_items: totalItems,
      sync_in_progress: inProgress,
      updated_at: new Date().toISOString()
    };
    
    // Only set these fields if we have valid values
    if (!inProgress) {
      updateData['last_sync_time'] = new Date().toISOString();
    }
    
    if (lastUID) {
      updateData['last_uid'] = lastUID;
    }
    
    if (errorMessage) {
      updateData['last_error'] = errorMessage;
    }
    
    if (existingStatus && existingStatus.length > 0) {
      // Update existing record
      await fetch(
        `${supabaseUrl}/rest/v1/email_sync_status?id=eq.${existingStatus[0].id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );
    } else {
      // Create new record
      await fetch(
        `${supabaseUrl}/rest/v1/email_sync_status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            folder: folder,
            ...updateData
          })
        }
      );
    }
  } catch (error) {
    console.error("Error updating sync status:", error);
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
    
    // Use optimized IMAP settings to prevent timeout issues
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
        rejectUnauthorized: false, // More permissive TLS for broader compatibility
        servername: settings.host,
        enableTrace: true, // Aktiviere Trace für bessere Fehlermeldungen
        minVersion: '', // Keine Einschränkung der TLS-Version für maximale Kompatibilität
        ciphers: 'ALL' // Alle verfügbaren Cipher erlauben für maximale Kompatibilität
      },
      connectionTimeout: 120000, // Auf 2 Minuten erhöhen für langsame Verbindungen
      greetTimeout: 60000, // Längerer Greeting-Timeout (1 Minute)
      socketTimeout: 120000, // Längerer Socket-Timeout (2 Minuten)
      disableCompression: true, // Deaktiviere Kompression für bessere Stabilität
      requireTLS: false, // Nicht zwingend TLS benötigen
      upgradeTTLSeconds: 180, // 3 Minuten für TLS-Upgrade (statt Standardwert)
      maxIdleTime: 30000 // 30 Sekunden für maximale Idle-Zeit
    };

    // Extract sync options from request with better defaults for reliability
    const syncOptions = {
      folder: requestData.folder || 'INBOX',
      forceRefresh: requestData.force_refresh || false,
      maxEmails: requestData.max_emails || settings.max_emails || 100,
      batchProcessing: requestData.batch_processing !== false,
      maxBatchSize: requestData.max_batch_size || 50, // Default to 50 for faster syncing
      connectionTimeout: requestData.connection_timeout || settings.connection_timeout || 30000,
      retryAttempts: requestData.retry_attempts || 3,
      folderSyncOnly: requestData.folder_sync_only || false,
      incrementalConnection: requestData.incremental_connection || false,
      loadLatest: requestData.load_latest !== false,
      historicalSync: requestData.historical_sync || settings.historical_sync || false,
      tlsOptions: requestData.tls_options || { rejectUnauthorized: false },
      ignoreDataValidation: requestData.ignore_date_validation || true, // Ignore date validation by default
      incrementalSync: requestData.incremental_sync !== false // Default to true for incremental sync
    };

    // Only sync folders if explicitly requested
    if (syncOptions.folderSyncOnly) {
      console.log("Folder sync only mode - redirecting to folder sync endpoint");
      
      // Call sync-folders endpoint
      const folderSyncResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/sync-folders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
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
