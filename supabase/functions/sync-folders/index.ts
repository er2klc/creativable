
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
}

// Define a function to sync IMAP folders
async function syncEmailFolders(
  imapSettings: ImapSettings,
  userId: string,
  retryCount = 0
) {
  console.log(`[Attempt ${retryCount + 1}] Getting email folders from: ${imapSettings.host}:${imapSettings.port}`);
  
  const client = new ImapFlow(imapSettings);
  
  try {
    // Connect to the server
    await client.connect();
    console.log("Successfully connected to IMAP server for folder synchronization");
    
    // Get all folders from the mail server
    const folderList = await client.list();
    console.log(`Found ${folderList.length} folders`);
    
    // Initialize environment variables
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Map to track folder types
    const specialFolders: Record<string, any> = {
      inbox: null,
      sent: null,
      drafts: null,
      trash: null,
      spam: null,
      archive: null,
    };
    
    // Process folders - first identify special folders
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
        if ((folderName.includes('sent') || folderName.includes('gesend') || folderName.includes('gesendet')) && !specialFolders.sent) specialFolders.sent = folder;
        if ((folderName.includes('draft') || folderName.includes('entwu')) && !specialFolders.drafts) specialFolders.drafts = folder;
        if ((folderName.includes('trash') || folderName.includes('papierkorb') || folderName.includes('müll') || folderName.includes('deleted')) && !specialFolders.trash) specialFolders.trash = folder;
        if ((folderName.includes('spam') || folderName.includes('junk')) && !specialFolders.spam) specialFolders.spam = folder;
        if ((folderName.includes('archiv') || folderName.includes('archive')) && !specialFolders.archive) specialFolders.archive = folder;
      }
    }
    
    const successfulFolders = [];
    const failedFolders = [];
    
    // Process each folder and save it to the database
    for (const folder of folderList) {
      let folderType = 'regular';
      let specialUse = null;
      
      // Determine folder type
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
        // Get folder status (message count, unread count)
        const mailbox = await client.status(folder.path, { messages: true, unseen: true });
        
        // Debug info
        console.log(`Folder: ${folder.path}, Type: ${folderType}, Messages: ${mailbox.messages}, Unread: ${mailbox.unseen}`);
        
        // Check if folder exists in database
        const checkResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${encodeURIComponent(userId)}&path=eq.${encodeURIComponent(folder.path)}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": SUPABASE_SERVICE_ROLE_KEY
            }
          }
        );
        
        const existingFolder = await checkResponse.json();
        
        if (existingFolder && existingFolder.length > 0) {
          // Update existing folder
          const updateResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/email_folders?id=eq.${existingFolder[0].id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "apikey": SUPABASE_SERVICE_ROLE_KEY
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
          
          if (updateResponse.ok) {
            console.log(`Updated folder: ${folder.path}`);
            successfulFolders.push(folder.path);
          } else {
            console.error(`Failed to update folder: ${folder.path}`, await updateResponse.text());
            failedFolders.push({path: folder.path, error: "Update failed"});
          }
        } else {
          // Create new folder
          const createResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/email_folders`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "apikey": SUPABASE_SERVICE_ROLE_KEY
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
            }
          );
          
          if (createResponse.ok) {
            console.log(`Created folder: ${folder.path}`);
            successfulFolders.push(folder.path);
          } else {
            console.error(`Failed to create folder: ${folder.path}`, await createResponse.text());
            failedFolders.push({path: folder.path, error: "Creation failed"});
          }
        }
      } catch (folderError) {
        console.error(`Error processing folder ${folder.path}:`, folderError);
        failedFolders.push({path: folder.path, error: folderError.message});
      }
    }
    
    // Properly log out and close the connection
    try {
      await client.logout();
    } catch (logoutError) {
      console.warn("Error during logout:", logoutError);
    }
    
    return {
      success: true,
      message: `Successfully synced ${successfulFolders.length} out of ${folderList.length} email folders`,
      folderCount: folderList.length,
      successfulFolders,
      failedFolders: failedFolders.length > 0 ? failedFolders : undefined
    };
  } catch (error) {
    console.error("IMAP folder sync error:", error);
    
    // Automatically retry with modified settings if this is the first attempt
    if (retryCount < 1) {
      console.log(`Retrying folder sync with modified settings...`);
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
    // Ensure the connection is properly closed
    if (client && client.usable) {
      try {
        client.close();
      } catch (closeError) {
        console.warn("Error closing IMAP connection:", closeError);
      }
    }
  }
}

serve(async (req) => {
  console.log("Email folders sync function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify(requestData));
    } catch (parseError) {
      requestData = {};
      console.log("No request data received");
    }

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
    console.log("Starting folder sync with valid session token");

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

    // Configure IMAP connection options from the settings
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
      connectionTimeout: settings.connection_timeout || 30000,
      greetTimeout: 15000,
      socketTimeout: 30000
    };

    // Sync folders
    const folderResult = await syncEmailFolders(imapConfig, userId);
    
    // Return the result
    return new Response(JSON.stringify(folderResult), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200,
    });

  } catch (error) {
    console.error("Email folders sync error:", error);
    
    const result = {
      success: false,
      message: "Failed to sync email folders",
      error: error.message,
      details: error.stack || "Unknown error"
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
