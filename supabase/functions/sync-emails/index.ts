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
  tls: {
    rejectUnauthorized: boolean;
    servername?: string;
  };
  connectionTimeout: number;
  greetTimeout: number;
  socketTimeout: number;
  disableCompression?: boolean;
}

interface SyncOptions {
  forceRefresh?: boolean;
  historicalSync?: boolean;
  startDate?: Date;
  maxEmails?: number;
  folder?: string;
  folderSyncOnly?: boolean;
}

// Add this new date validation function
function isDateInFuture(date: Date): boolean {
  const currentDate = new Date();
  return date > currentDate;
}

// Add this near the top of the file
const debugMode = true; // Set to true for additional logging

// Function to sync email folders
async function syncEmailFolders(
  imapSettings: ImapSettings,
  userId: string,
  retryCount = 0
): Promise<SyncResult> {
  // Check for system time issues
  const currentTime = new Date();
  if (isDateInFuture(currentTime)) {
    console.error(`SYSTEM TIME ERROR: System time appears to be in the future: ${currentTime.toISOString()}`);
    return {
      success: false,
      message: "System time error: Your system clock appears to be set to a future date, which can cause authentication failures",
      error: "System time is set to a future date",
      details: `Current system time: ${currentTime.toISOString()}`
    };
  }

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
          console.log(`Updating existing folder: ${folder.path}`);
          
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
          console.log(`Creating new folder: ${folder.path}`);
          
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
              console.log(`Attempting to update folder ${folder.path} due to conflict`);
              
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
        console.log(`Deleting non-existent folder from database: ${existingFolder.path}`);
        
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
      console.log(`Retrying folder sync (${retryCount + 1}/2)...`);
      
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
        return syncEmailFolders(newSettings, userId, retryCount + 1);
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
        return syncEmailFolders(newSettings, userId, retryCount + 1);
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

// Function to fetch emails from a specific folder
async function fetchEmails(
  imapSettings: ImapSettings, 
  userId: string, 
  options: SyncOptions = {}, 
  retryCount = 0
): Promise<SyncResult> {
  // Check for system time issues
  const currentTime = new Date();
  if (isDateInFuture(currentTime)) {
    console.error(`SYSTEM TIME ERROR: System time appears to be in the future: ${currentTime.toISOString()}`);
    return {
      success: false,
      message: "System time error: Your system clock appears to be set to a future date, which can cause authentication failures",
      error: "System time is set to a future date",
      details: `Current system time: ${currentTime.toISOString()}`
    };
  }

  // Original function continues
  console.log(`[Attempt ${retryCount + 1}] Connecting to IMAP server: ${imapSettings.host}:${imapSettings.port} (secure: ${imapSettings.secure})`);
  console.log(`Sync options:`, JSON.stringify(options));
  
  const client = new ImapFlow(imapSettings);
  const maxEmails = options.maxEmails || 100;
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
    
    // Always get the most recent emails first using sequence numbers
    const fetchOptions = {
      seq: `${Math.max(1, mailbox.exists - fetchCount + 1)}:${mailbox.exists}`,
      envelope: true,
      bodyStructure: true,
      source: true
    };
    
    console.log(`Fetch options:`, JSON.stringify(fetchOptions));
    
    const emails = [];
    let counter = 0;
    
    // Fetch messages
    for await (const message of client.fetch(fetchOptions)) {
      if (debugMode) {
        console.log(`Processing message #${message.seq}, messageId: ${message.envelope.messageId}, date: ${message.envelope.date}`);
        console.log(`Message flags: ${JSON.stringify(message.flags)}`);
      }
      
      try {
        // Parse email with mailparser
        const parsed = await simpleParser(message.source);
        
        // Extract email data
        const parsedEmail = {
          message_id: parsed.messageId || message.envelope.messageId || `<generated-${Date.now()}>`,
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
          read: message.flags.includes("\\Seen"),
          starred: message.flags.includes("\\Flagged"),
          has_attachments: parsed.attachments && parsed.attachments.length > 0,
          flags: message.flags,
          headers: Object.fromEntries(
            Array.from(parsed.headerLines).map(([key, value]) => {
              return [key, value];
            })
          )
        };
        
        const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
        
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
          console.log(`Updating existing email: ${emailId}`);
          
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
            counter++;
            emails.push(parsedEmail);
          }
        } else {
          // Insert new email
          console.log(`Inserting new email: ${parsedEmail.message_id}`);
          
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
              console.log(`Duplicate email found, updating instead: ${parsedEmail.message_id}`);
              
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
                    counter++;
                    emails.push(parsedEmail);
                  } else {
                    console.error(`Failed to update email after duplicate check: ${await updateResponse.text()}`);
                  }
                }
              }
            }
          } else {
            counter++;
            emails.push(parsedEmail);
          }
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
  console.log("Email sync function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
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
      folder_sync_only = false,
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
      logger: false,
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
        servername: settings.host // Explicitly set servername
      },
      connectionTimeout: 30000, // 30 seconds
      greetTimeout: 15000,      // 15 seconds
      socketTimeout: 30000,     // 30 seconds
      disableCompression: false // Keep compression enabled by default
    };

    // First sync folders if force refresh or it's a periodic sync or specifically requested
    let folderResult = { success: true };
    if (force_refresh || folder_sync_only) {
      console.log("Starting folder sync...");
      folderResult = await syncEmailFolders(imapConfig, userId);
      
      // If it's a folder-only sync request, return result immediately
      if (folder_sync_only) {
        console.log("Folder sync completed with result:", folderResult);
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
    console.log("Starting email sync for folder:", folder);
    
    // Prepare sync options
    const syncOptions: SyncOptions = {
      forceRefresh: force_refresh,
      maxEmails: max_emails || settings.max_emails || 1
