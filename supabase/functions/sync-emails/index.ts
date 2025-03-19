
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from 'npm:imapflow@1.0.98';
import { simpleParser } from 'npm:mailparser@3.6.5';
import * as log from 'npm:console';

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
}

// Add this new date validation function
function isDateInFuture(date: Date): boolean {
  const currentDate = new Date();
  return date > currentDate;
}

// Function to sync email folders with incremental connection handling
async function syncEmailFolders(
  imapSettings: ImapSettings,
  userId: string,
  options: SyncOptions = {},
  retryCount = 0
): Promise<SyncResult> {
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

  debugLog(`[Attempt ${retryCount + 1}] Getting email folders from: ${imapSettings.host}:${imapSettings.port} (secure: ${imapSettings.secure})`);
  
  const client = new ImapFlow(imapSettings);
  
  try {
    // Create a connection timeout promise
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection timed out after ${imapSettings.connectionTimeout}ms`));
      }, imapSettings.connectionTimeout);
    });
    
    // Race the connection and timeout
    await Promise.race([connectPromise, timeoutPromise]);
    
    debugLog("Successfully connected to IMAP server for folder synchronization");
    
    const folderList = await client.list();
    debugLog(`Found ${folderList.length} folders`);
    
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
    
    // First, get all existing folders for this user to determine which ones need to be created/updated/deleted
    const existingFoldersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${userId}&select=id,path`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    );
    
    if (!existingFoldersResponse.ok) {
      console.error("Error fetching existing folders:", await existingFoldersResponse.text());
      throw new Error("Failed to fetch existing folders");
    }
    
    const existingFolders = await existingFoldersResponse.json();
    const existingFolderPaths = new Set(existingFolders.map(f => f.path));
    
    // Process each folder from IMAP
    const processedFolders = [];
    
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
        // Get mailbox status (message count, unread count)
        let mailbox;
        try {
          mailbox = await client.status(folder.path, { messages: true, unseen: true });
        } catch (statusError) {
          console.error(`Error getting status for folder ${folder.path}:`, statusError);
          mailbox = { messages: 0, unseen: 0 };
        }
        
        if (existingFolderPaths.has(folder.path)) {
          // Update existing folder
          debugLog(`Updating existing folder: ${folder.path}`);
          
          const updateResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${userId}&path=eq.${encodeURIComponent(folder.path)}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Prefer': 'return=minimal'
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
            }
          );
          
          if (!updateResponse.ok) {
            console.error(`Failed to update folder: ${await updateResponse.text()}`);
          }
        } else {
          // Create new folder
          debugLog(`Creating new folder: ${folder.path}`);
          
          const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_folders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Prefer': 'return=minimal'
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
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          });
          
          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error(`Failed to create folder: ${errorText}`);
            
            // If it's a duplicate key error, try an update instead
            if (errorText.includes('duplicate key value')) {
              debugLog(`Attempting to update folder ${folder.path} due to conflict`);
              
              const conflictUpdateResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${userId}&path=eq.${encodeURIComponent(folder.path)}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=minimal'
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
                }
              );
              
              if (!conflictUpdateResponse.ok) {
                console.error(`Failed to update folder after conflict: ${await conflictUpdateResponse.text()}`);
              }
            }
          }
        }
        
        processedFolders.push(folder.path);
      } catch (folderError) {
        console.error(`Error processing folder ${folder.path}:`, folderError);
      }
    }
    
    // Check for folders that exist in the database but not on the IMAP server anymore
    for (const existingFolder of existingFolders) {
      if (!processedFolders.includes(existingFolder.path)) {
        // Delete folder from database that doesn't exist on server anymore
        debugLog(`Deleting non-existent folder from database: ${existingFolder.path}`);
        
        const deleteResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/email_folders?id=eq.${existingFolder.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Prefer': 'return=minimal'
            }
          }
        );
        
        if (!deleteResponse.ok) {
          console.error(`Failed to delete folder: ${await deleteResponse.text()}`);
        }
      }
    }
    
    try {
      await client.logout();
    } catch (logoutError) {
      console.error("Error during IMAP logout:", logoutError);
    }
    
    return {
      success: true,
      message: `Successfully synced ${folderList.length} email folders`,
      folderCount: folderList.length
    };
  } catch (error) {
    console.error("IMAP folder sync error:", error);
    
    if (retryCount < 2) {
      debugLog(`Retrying folder sync (${retryCount + 1}/2)...`);
      
      // For first retry: try with different SSL settings
      if (retryCount === 0) {
        const newSettings = {
          ...imapSettings,
          secure: !imapSettings.secure, // Toggle secure setting
          port: imapSettings.secure ? 143 : 993, // Toggle port based on secure setting
          tls: {
            ...imapSettings.tls,
            rejectUnauthorized: false, // Don't fail on invalid certificates for retry
            enableTrace: true
          },
          connectionTimeout: imapSettings.connectionTimeout * 1.5 // Increase timeout
        };
        return syncEmailFolders(newSettings, userId, options, retryCount + 1);
      } 
      // For second retry: try with very permissive settings and longer timeout
      else {
        const newSettings = {
          ...imapSettings,
          secure: true, // Force secure
          port: 993, // Standard secure port
          tls: {
            rejectUnauthorized: false,
            enableTrace: true,
            minVersion: "TLSv1" // Try older TLS version
          },
          disableCompression: true, // Try disabling compression
          connectionTimeout: 90000, // 90 second timeout
          greetTimeout: 30000,
          socketTimeout: 90000
        };
        return syncEmailFolders(newSettings, userId, options, retryCount + 1);
      }
    }
    
    return {
      success: false,
      message: "Failed to sync email folders",
      error: error.message,
      details: error.stack || "Unknown error during folder sync"
    };
  } finally {
    if (client.usable) {
      try {
        client.close();
      } catch (closeError) {
        console.error("Error closing IMAP client:", closeError);
      }
    }
  }
}

// Function to fetch emails with batch processing
async function fetchEmails(
  imapSettings: ImapSettings,
  userId: string,
  options: SyncOptions = {},
  retryCount = 0
): Promise<SyncResult> {
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

  // Original function continues
  debugLog(`[Attempt ${retryCount + 1}] Connecting to IMAP server: ${imapSettings.host}:${imapSettings.port} (secure: ${imapSettings.secure})`);
  debugLog(`Sync options:`, JSON.stringify(options));
  
  const client = new ImapFlow(imapSettings);
  const maxEmails = options.maxEmails || 100;
  const folder = options.folder || 'INBOX';
  const batchSize = options.maxBatchSize || 25;
  const batchProcessing = options.batchProcessing !== false;
  
  try {
    debugLog("Creating connection promise...");
    
    // Create a connection timeout promise
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        if (client.usable) {
          try {
            client.close();
          } catch (e) {
            // Ignore close errors
          }
        }
        reject(new Error(`Connection timed out after ${imapSettings.connectionTimeout}ms`));
      }, imapSettings.connectionTimeout);
    });
    
    // Race the connection and timeout
    await Promise.race([connectPromise, timeoutPromise]);
    
    debugLog("Successfully connected to IMAP server");
    
    // Select the mailbox
    debugLog(`Attempting to open mailbox: ${folder}`);
    const mailbox = await client.mailboxOpen(folder);
    debugLog(`Mailbox opened with ${mailbox.exists} messages`);
    
    // Determine how many emails to fetch
    const totalEmails = Math.min(maxEmails, mailbox.exists);
    
    if (totalEmails === 0) {
      return {
        success: true,
        message: "No emails found in mailbox",
        emailsCount: 0,
        progress: 100
      };
    }
    
    // Calculate total batches if batch processing is enabled
    const totalBatches = batchProcessing ? Math.ceil(totalEmails / batchSize) : 1;
    const emails = [];
    let emailCounter = 0;
    
    debugLog(`Will process ${totalEmails} emails in ${totalBatches} batches of ${batchSize}`);
    
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    // Process emails in batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      if (!client.usable) {
        debugLog("Client disconnected, reconnecting...");
        await client.connect();
      }
      
      const start = Math.max(1, mailbox.exists - (maxEmails - (batchIndex * batchSize)) + 1);
      const end = Math.max(1, start + Math.min(batchSize - 1, totalEmails - emailCounter - 1));
      
      const batchFetchOptions = {
        seq: `${start}:${end}`,
        envelope: true,
        bodyStructure: true,
        source: true
      };
      
      debugLog(`Processing batch ${batchIndex + 1}/${totalBatches}: sequence ${start}:${end}`);
      
      // Fetch messages in this batch
      try {
        for await (const message of client.fetch(batchFetchOptions)) {
          debugLog(`Processing message #${message.seq}, messageId: ${message.envelope?.messageId}, date: ${message.envelope?.date}`);
          
          try {
            // Parse email with mailparser
            const parsed = await simpleParser(message.source);
            
            // Extract email data
            const parsedEmail = {
              message_id: parsed.messageId || message.envelope?.messageId || `<generated-${Date.now()}>`,
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
              sent_at: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
              received_at: new Date().toISOString(),
              user_id: userId,
              read: message.flags?.includes("\\Seen") || false,
              starred: message.flags?.includes("\\Flagged") || false,
              has_attachments: parsed.attachments && parsed.attachments.length > 0,
              flags: message.flags || [],
              headers: Object.fromEntries(
                Array.from(parsed.headerLines || []).map(([key, value]) => {
                  return [key, value];
                })
              ),
              batch_index: batchIndex,
              sequence_number: message.seq
            };
            
            // First, check if this email already exists 
            const checkResponse = await fetch(
              `${SUPABASE_URL}/rest/v1/emails?user_id=eq.${userId}&message_id=eq.${encodeURIComponent(parsedEmail.message_id)}&select=id`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': SUPABASE_SERVICE_ROLE_KEY,
                  'Accept': 'application/json'
                }
              }
            );
            
            if (!checkResponse.ok) {
              console.error(`Error checking for existing email: ${await checkResponse.text()}`);
              continue;
            }
            
            const existingEmails = await checkResponse.json();
            
            if (existingEmails && existingEmails.length > 0) {
              // Update existing email
              const emailId = existingEmails[0].id;
              debugLog(`Updating existing email: ${emailId}`);
              
              const updateResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/emails?id=eq.${emailId}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=minimal'
                  },
                  body: JSON.stringify({
                    folder: parsedEmail.folder,
                    read: parsedEmail.read,
                    starred: parsedEmail.starred,
                    flags: parsedEmail.flags,
                    updated_at: new Date().toISOString()
                  })
                }
              );
              
              if (!updateResponse.ok) {
                console.error(`Failed to update email: ${await updateResponse.text()}`);
              } else {
                emailCounter++;
                emails.push(parsedEmail);
              }
            } else {
              // Insert new email
              debugLog(`Inserting new email: ${parsedEmail.message_id}`);
              
              const insertResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/emails`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=minimal'
                  },
                  body: JSON.stringify(parsedEmail)
                }
              );
              
              if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                console.error(`Failed to store email: ${errorText}`);
                
                // If it's a duplicate key error, try an update instead
                if (errorText.includes('duplicate key value')) {
                  debugLog(`Duplicate email found, updating instead: ${parsedEmail.message_id}`);
                  
                  // Since we got a duplicate key error, we need to fetch the ID to update
                  const idCheckResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/emails?user_id=eq.${userId}&message_id=eq.${encodeURIComponent(parsedEmail.message_id)}&select=id`,
                    {
                      headers: {
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'apikey': SUPABASE_SERVICE_ROLE_KEY
                      }
                    }
                  );
                  
                  if (idCheckResponse.ok) {
                    const existingEmails = await idCheckResponse.json();
                    if (existingEmails && existingEmails.length > 0) {
                      const emailId = existingEmails[0].id;
                      
                      const updateResponse = await fetch(
                        `${SUPABASE_URL}/rest/v1/emails?id=eq.${emailId}`,
                        {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            'apikey': SUPABASE_SERVICE_ROLE_KEY,
                            'Prefer': 'return=minimal'
                          },
                          body: JSON.stringify({
                            folder: parsedEmail.folder,
                            read: parsedEmail.read,
                            starred: parsedEmail.starred,
                            flags: parsedEmail.flags,
                            updated_at: new Date().toISOString()
                          })
                        }
                      );
                      
                      if (updateResponse.ok) {
                        emailCounter++;
                        emails.push(parsedEmail);
                      } else {
                        console.error(`Failed to update email after duplicate check: ${await updateResponse.text()}`);
                      }
                    }
                  }
                }
              } else {
                emailCounter++;
                emails.push(parsedEmail);
              }
            }
          } catch (parseError) {
            console.error("Error processing email:", parseError);
          }
        }
      } catch (batchError) {
        console.error(`Error processing batch ${batchIndex + 1}:`, batchError);
        
        // Try to reconnect on batch error
        if (client.usable) {
          try { 
            await client.close();
          } catch (e) {
            // Ignore close errors
          }
        }
        
        try {
          await client.connect();
          await client.mailboxOpen(folder);
        } catch (reconnectError) {
          console.error("Failed to reconnect after batch error:", reconnectError);
          // Continue with next batch anyway
        }
      }
      
      // Log progress after each batch
      const progress = Math.min(100, Math.round((emailCounter / totalEmails) * 100));
      debugLog(`Batch ${batchIndex + 1}/${totalBatches} complete. Progress: ${progress}%. Emails processed: ${emailCounter}/${totalEmails}`);
    }
    
    // Update the unread count for the folder
    try {
      const mailboxStatus = await client.status(folder, { unseen: true, messages: true });
      
      await fetch(`${SUPABASE_URL}/rest/v1/email_folders?path=eq.${encodeURIComponent(folder)}&user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Prefer': 'return=minimal'
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
    
    try {
      await client.logout();
    } catch (logoutError) {
      console.error("Error during IMAP logout:", logoutError);
    }
    
    debugLog(`Successfully fetched ${emailCounter} emails`);
    
    return {
      success: true,
      message: `Successfully synced ${emailCounter} emails`,
      emailsCount: emailCounter,
      progress: 100,
      batchProcessing: {
        totalBatches,
        completedBatches: totalBatches,
        emailsPerBatch: batchSize
      }
    };
    
  } catch (error) {
    console.error("IMAP error:", error);
    
    // Only retry for connection errors, not authentication errors
    if (retryCount < (options.retryAttempts || 2) && 
        (error.message.includes('timeout') || 
         error.message.includes('connection') || 
         error.message.includes('ECONNRESET') ||
         error.message.includes('Failed to upgrade') ||
         error.message.includes('TLS'))) {
      
      debugLog(`Retrying connection (${retryCount + 1}/${options.retryAttempts || 2}) with modified settings...`);
      
      // For first retry: try with different SSL settings
      if (retryCount === 0) {
        const newSettings = {
          ...imapSettings,
          secure: !imapSettings.secure, // Toggle secure setting
          port: imapSettings.secure ? 143 : 993, // Toggle port based on secure setting
          tls: {
            ...imapSettings.tls,
            rejectUnauthorized: false, // Don't fail on invalid certificates for retry
            enableTrace: true,
            minVersion: "TLSv1"
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
            rejectUnauthorized: false,
            enableTrace: true,
            minVersion: "TLSv1" // Try older TLS version
          },
          disableCompression: true, // Try disabling compression
          connectionTimeout: 90000, // 90 second timeout
          greetTimeout: 30000,
          socketTimeout: 90000,
          emitLogs: true
        };
        return fetchEmails(newSettings, userId, { ...options, maxBatchSize: 5 }, retryCount + 1);
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
  debugLog("Email sync function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      debugLog("Request data received:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      // If there's no body or it can't be parsed, use default values
      requestData = { force_refresh: false };
    }

    const { 
      force_refresh = false,
      folder_sync_only = false,
      historical_sync = false,
      sync_start_date = null,
      max_emails = 100,
      folder = 'INBOX',
      batch_processing = true,
      max_batch_size = 25,
      connection_timeout = 60000,
      disable_certificate_validation = true,
      ignore_date_validation = true,
      retry_attempts = 3,
      debug = true,
      tls_options = {
        rejectUnauthorized: false,
        enableTrace: true,
        minVersion: "TLSv1"
      },
      incremental_connection = true
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
    
    // Record sync start in the sync status table
    await fetch(`${SUPABASE_URL}/rest/v1/email_sync_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        status: 'in_progress',
        folder: folder,
        message: 'Sync started',
        created_at: new Date().toISOString(),
        synchronization_type: folder_sync_only ? 'folders' : 'emails'
      })
    });
    
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
            'Prefer': 'return=minimal'
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
      logger: debug,
      tls: {
        rejectUnauthorized: !disable_certificate_validation,
        servername: settings.host,
        enableTrace: true,
        minVersion: tls_options?.minVersion || "TLSv1"
      },
      connectionTimeout: connection_timeout || 60000,
      greetTimeout: 30000,
      socketTimeout: 60000,
      disableCompression: false,
      emitLogs: debug
    };

    debugLog("Using IMAP config:", {
      host: imapConfig.host,
      port: imapConfig.port,
      secure: imapConfig.secure,
      user: imapConfig.auth.user,
      connectionTimeout: imapConfig.connectionTimeout,
      tls: {
        rejectUnauthorized: imapConfig.tls.rejectUnauthorized,
        minVersion: imapConfig.tls.minVersion
      }
    });

    // First sync folders if force refresh or it's a periodic sync or specifically requested
    let folderResult = { success: true };
    if (force_refresh || folder_sync_only) {
      debugLog("Starting folder sync...");
      folderResult = await syncEmailFolders(imapConfig, userId, {
        ignoreDataValidation: ignore_date_validation,
        retryAttempts: retry_attempts,
        connectionTimeout: connection_timeout,
        tlsOptions: tls_options,
        incrementalConnection: incremental_connection
      });
      
      // Update the sync status with folder result
      await fetch(`${SUPABASE_URL}/rest/v1/email_sync_status?user_id=eq.${userId}&status=eq.in_progress&synchronization_type=eq.folders`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: folderResult.success ? 'success' : 'error',
          message: folderResult.message,
          error: folderResult.error,
          details: folderResult.details,
          completed_at: new Date().toISOString()
        })
      });
      
      // If it's a folder-only sync request, return result immediately
      if (folder_sync_only) {
        debugLog("Folder sync completed with result:", folderResult);
        return new Response(JSON.stringify(folderResult), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
          status: 200,
        });
      }
      
      if (!folderResult.success) {
        console.error("Folder sync failed:", folderResult);
        return new Response(JSON.stringify(folderResult), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
          status: 200, // Return 200 even on error to get the error details on frontend
        });
      }
    }

    // If we're here and folder sync was successful (or not requested), proceed with email sync
    debugLog("Starting email sync for folder:", folder);
    
    // Prepare sync options
    const syncOptions: SyncOptions = {
      forceRefresh: force_refresh,
      maxEmails: max_emails || settings.max_emails || 100,
      folder: folder,
      batchProcessing: batch_processing,
      maxBatchSize: max_batch_size || 25,
      retryAttempts: retry_attempts || 3,
      connectionTimeout: connection_timeout || 60000,
      tlsOptions: tls_options,
      incrementalConnection: incremental_connection
    };
    
    // Call fetchEmails with the prepared options
    const result = await fetchEmails(imapConfig, userId, syncOptions);
    
    // Update the sync status with the result
    await fetch(`${SUPABASE_URL}/rest/v1/email_sync_status?user_id=eq.${userId}&status=eq.in_progress&synchronization_type=eq.emails`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        status: result.success ? 'success' : 'error',
        message: result.message,
        error: result.error,
        details: result.details,
        completed_at: new Date().toISOString()
      })
    });
    
    // Update the IMAP settings with the last sync date and status
    await fetch(`${SUPABASE_URL}/rest/v1/imap_settings?id=eq.${settings.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        last_sync_date: new Date().toISOString(),
        sync_status: result.success ? 'success' : 'error',
        sync_error: result.error || null
      })
    });
    
    debugLog("Email sync completed with result:", result);
    
    // Return the response
    return new Response(JSON.stringify({
      ...result,
      folderResult: folderResult
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200,
    });
    
  } catch (error: any) {
    console.error("Error in sync-emails function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      message: error.message || "An unknown error occurred",
      error: error.message,
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
