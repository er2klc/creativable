
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
  };
  connectionTimeout: number;
  greetTimeout: number;
  socketTimeout: number;
  disableCompression?: boolean;
}

interface SyncFoldersRequest {
  force_retry?: boolean;
  detailed_logging?: boolean;
}

interface SyncResult {
  success: boolean;
  message: string;
  folderCount?: number;
  error?: string;
  details?: string;
}

async function syncFolders(
  imapSettings: ImapSettings,
  userId: string,
  options: SyncFoldersRequest = {},
  retryCount = 0
): Promise<SyncResult> {
  const { detailed_logging = false } = options;
  
  if (detailed_logging) {
    console.log(`[Attempt ${retryCount + 1}] Getting email folders from: ${imapSettings.host}:${imapSettings.port}`);
    console.log(`IMAP Configuration:`, JSON.stringify({
      host: imapSettings.host,
      port: imapSettings.port,
      secure: imapSettings.secure,
      user: imapSettings.auth.user,
      // Mask password for security
      pass: "********",
      tls: imapSettings.tls
    }));
  }
  
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
        const mailbox = await client.status(folder.path, { messages: true, unseen: true });
        
        if (existingFolderPaths.has(folder.path)) {
          // Update existing folder
          if (detailed_logging) {
            console.log(`Updating existing folder: ${folder.path}`);
          }
          
          const updateResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${userId}&path=eq.${encodeURIComponent(folder.path)}`,
            {
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
            }
          );
          
          if (!updateResponse.ok && detailed_logging) {
            console.error(`Failed to update folder: ${await updateResponse.text()}`);
          }
        } else {
          // Create new folder
          if (detailed_logging) {
            console.log(`Creating new folder: ${folder.path}`);
          }
          
          const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_folders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY
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
          
          if (!createResponse.ok && detailed_logging) {
            console.error(`Failed to create folder: ${await createResponse.text()}`);
          }
        }
        
        processedFolders.push(folder.path);
      } catch (folderError) {
        console.error(`Error processing folder ${folder.path}:`, folderError);
      }
    }
    
    // Check for folders that exist in the database but not on the IMAP server
    for (const existingFolder of existingFolders) {
      if (!processedFolders.includes(existingFolder.path)) {
        // Delete folder from database that doesn't exist on server anymore
        if (detailed_logging) {
          console.log(`Deleting non-existent folder from database: ${existingFolder.path}`);
        }
        
        await fetch(
          `${SUPABASE_URL}/rest/v1/email_folders?id=eq.${existingFolder.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
            }
          }
        );
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
        return syncFolders(newSettings, userId, options, retryCount + 1);
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
        return syncFolders(newSettings, userId, options, retryCount + 1);
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
      client.close();
    }
  }
}

serve(async (req) => {
  console.log("Email folder sync function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestData: SyncFoldersRequest = {};
    try {
      requestData = await req.json();
    } catch (parseError) {
      // If there's no body or it can't be parsed, use default values
      requestData = {};
    }
    
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
      tls: {
        rejectUnauthorized: false,
        servername: settings.host
      },
      connectionTimeout: 30000,
      greetTimeout: 15000,
      socketTimeout: 30000,
      disableCompression: false
    };

    // Sync folders
    const syncResult = await syncFolders(imapConfig, userId, requestData);
    
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

    return new Response(
      JSON.stringify(syncResult),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Folder sync error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to sync email folders",
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
