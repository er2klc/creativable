
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
      // Skip some system folders
      if (mailbox.flags.includes('\\Noselect')) {
        continue;
      }
      
      let folderType = "custom";
      
      // Determine folder type based on flags or name
      if (mailbox.flags.includes('\\Inbox') || mailbox.path.toLowerCase() === 'inbox') {
        folderType = "inbox";
      } else if (mailbox.flags.includes('\\Sent') || /sent/i.test(mailbox.path)) {
        folderType = "sent";
      } else if (mailbox.flags.includes('\\Drafts') || /draft/i.test(mailbox.path)) {
        folderType = "drafts";
      } else if (mailbox.flags.includes('\\Junk') || /spam|junk/i.test(mailbox.path)) {
        folderType = "spam";
      } else if (mailbox.flags.includes('\\Trash') || /trash|deleted/i.test(mailbox.path)) {
        folderType = "trash";
      } else if (mailbox.flags.includes('\\Archive') || /archive/i.test(mailbox.path)) {
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
        flags: mailbox.flags,
        total_messages: status?.messages || 0,
        unread_messages: status?.unseen || 0,
        user_id: userId
      });
    }
    
    await client.logout();
    console.log("Successfully fetched and processed folders");
    
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    // First delete existing folders
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
    
    // Then insert new folders
    if (folderList.length > 0) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/email_folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(folderList)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to store folders:", errorText);
        throw new Error(`Failed to store folders: ${errorText}`);
      }
    }
    
    return {
      success: true,
      message: `Successfully synced ${folderList.length} folders`,
      folders: folderList
    };
    
  } catch (error) {
    console.error("IMAP error:", error);
    return {
      success: false,
      message: "Failed to sync folders",
      error: error.message
    };
  } finally {
    if (client.usable) {
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
