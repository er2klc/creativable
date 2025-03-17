
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
  folders?: any[];
  folderCount?: number;
  error?: string;
}

async function fetchFolders(imapSettings: any, userId: string): Promise<SyncResult> {
  console.log(`Connecting to IMAP server: ${imapSettings.host}:${imapSettings.port}`);
  
  const client = new ImapFlow({
    host: imapSettings.host,
    port: imapSettings.port,
    secure: imapSettings.secure,
    auth: {
      user: imapSettings.username,
      pass: imapSettings.password
    },
    logger: false,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetTimeout: 15000,
    socketTimeout: 30000
  });
  
  try {
    await client.connect();
    console.log("Successfully connected to IMAP server");
    
    // Get list of mailboxes
    const list = await client.list();
    console.log(`Found ${list.length} mailboxes`);
    
    const folderList = [];
    
    // Process the mailboxes
    for (const mailbox of list) {
      // Safety check for object structure and flags
      if (!mailbox) {
        console.log("Skipping undefined mailbox");
        continue;
      }
      
      // Ensure flags is an array
      const flags = Array.isArray(mailbox.flags) ? mailbox.flags : [];
      
      // Skip some system folders
      if (flags.includes('\\Noselect')) {
        continue;
      }
      
      let folderType = "custom";
      
      // Determine folder type based on flags or name
      // Case insensitive checking for folder types
      const path = mailbox.path || '';
      const pathLower = path.toLowerCase();
      
      if (flags.includes('\\Inbox') || pathLower === 'inbox') {
        folderType = "inbox";
      } else if (flags.includes('\\Sent') || /sent/i.test(pathLower)) {
        folderType = "sent";
      } else if (flags.includes('\\Drafts') || /draft/i.test(pathLower)) {
        folderType = "drafts";
      } else if (flags.includes('\\Junk') || /spam|junk/i.test(pathLower)) {
        folderType = "spam";
      } else if (flags.includes('\\Trash') || /trash|deleted/i.test(pathLower)) {
        folderType = "trash";
      } else if (flags.includes('\\Archive') || /archive/i.test(pathLower)) {
        folderType = "archive";
      }
      
      // Try to get message count for this mailbox
      let status = null;
      try {
        status = await client.status(mailbox.path, { messages: true, unseen: true });
      } catch (error) {
        console.log(`Could not get status for ${mailbox.path}:`, error.message);
      }
      
      // Add to folder list
      folderList.push({
        name: mailbox.name || mailbox.path.split('/').pop() || mailbox.path,
        path: mailbox.path,
        type: folderType,
        special_use: mailbox.specialUse || null,
        flags: flags,
        total_messages: status?.messages || 0,
        unread_messages: status?.unseen || 0,
        user_id: userId
      });
    }
    
    await client.logout();
    console.log("Successfully fetched and processed folders");
    
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    // First, check if the email_folders table exists
    try {
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_folders?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        }
      });
      
      // If the table doesn't exist, return an error
      if (!checkResponse.ok && checkResponse.status === 404) {
        throw new Error("email_folders table does not exist. Please run the migration first.");
      }
    } catch (error) {
      console.error("Error checking email_folders table:", error);
      return {
        success: false,
        message: "Failed to verify email_folders table exists",
        error: error.message
      };
    }
    
    // Delete existing folders
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_folders?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
    if (!deleteResponse.ok) {
      console.error("Failed to delete existing folders:", await deleteResponse.text());
    }
    
    // Then insert new folders using a proper upsert pattern
    if (folderList.length > 0) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/email_folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(folderList)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to store folders:", errorText);
        throw new Error(`Failed to store folders: ${errorText}`);
      }
    }
    
    // Update imap_settings with last sync time
    await fetch(`${SUPABASE_URL}/rest/v1/imap_settings?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        last_sync_at: new Date().toISOString()
      })
    });
    
    return {
      success: true,
      message: `Successfully synced ${folderList.length} folders`,
      folders: folderList,
      folderCount: folderList.length
    };
    
  } catch (error) {
    console.error("IMAP error:", error);
    return {
      success: false,
      message: "Failed to sync folders",
      error: error.message
    };
  } finally {
    if (client && client.usable) {
      client.close();
    }
  }
}

serve(async (req) => {
  console.log("Folder sync function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Fetch folders
    const result = await fetchFolders(imapSettings[0], userId);
    
    // After folder sync, initiate email sync if folders were successfully created
    if (result.success && result.folderCount && result.folderCount > 0) {
      try {
        console.log("Starting email sync after successful folder sync");
        
        // Call the sync-emails function
        const emailSyncResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/sync-emails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${jwt}`,
              "Accept": "application/json"
            },
            body: JSON.stringify({
              force_refresh: true,
              folder: "INBOX" // Start with inbox as default
            })
          }
        );
        
        if (!emailSyncResponse.ok) {
          console.error("Failed to sync emails:", await emailSyncResponse.text());
        } else {
          console.log("Email sync initiated successfully");
        }
      } catch (emailSyncError) {
        console.error("Error initiating email sync:", emailSyncError);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200,
    });

  } catch (error) {
    console.error("Folder sync error:", error);
    
    const result: SyncResult = {
      success: false,
      message: "Failed to sync folders",
      error: error.message
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
