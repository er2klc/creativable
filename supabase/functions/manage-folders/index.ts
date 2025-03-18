
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
  };
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

interface ManageFolderRequest {
  action: 'create' | 'delete' | 'rename';
  folder_name?: string;
  folder_path?: string;
  new_name?: string;
}

async function createFolder(imapSettings: ImapSettings, folderName: string): Promise<boolean> {
  console.log(`Creating folder: ${folderName}`);
  const client = new ImapFlow(imapSettings);
  
  try {
    await client.connect();
    console.log("Successfully connected to IMAP server");
    
    // Create the folder
    await client.mailboxCreate(folderName);
    console.log(`Successfully created folder: ${folderName}`);
    
    await client.logout();
    return true;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  } finally {
    if (client.usable) {
      client.close();
    }
  }
}

async function deleteFolder(imapSettings: ImapSettings, folderPath: string): Promise<boolean> {
  console.log(`Deleting folder: ${folderPath}`);
  const client = new ImapFlow(imapSettings);
  
  try {
    await client.connect();
    console.log("Successfully connected to IMAP server");
    
    // Delete the folder
    await client.mailboxDelete(folderPath);
    console.log(`Successfully deleted folder: ${folderPath}`);
    
    await client.logout();
    return true;
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  } finally {
    if (client.usable) {
      client.close();
    }
  }
}

async function renameFolder(imapSettings: ImapSettings, folderPath: string, newName: string): Promise<boolean> {
  console.log(`Renaming folder: ${folderPath} to ${newName}`);
  const client = new ImapFlow(imapSettings);
  
  try {
    await client.connect();
    console.log("Successfully connected to IMAP server");
    
    // Rename the folder
    await client.mailboxRename(folderPath, newName);
    console.log(`Successfully renamed folder from ${folderPath} to ${newName}`);
    
    await client.logout();
    return true;
  } catch (error) {
    console.error("Error renaming folder:", error);
    throw error;
  } finally {
    if (client.usable) {
      client.close();
    }
  }
}

serve(async (req) => {
  console.log("Folder management function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData: ManageFolderRequest = await req.json();
    console.log("Request data received:", JSON.stringify(requestData, null, 2));

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

    let result;
    
    // Perform the requested action
    switch (requestData.action) {
      case 'create':
        if (!requestData.folder_name) {
          throw new Error("folder_name is required for create action");
        }
        result = await createFolder(imapConfig, requestData.folder_name);
        break;
        
      case 'delete':
        if (!requestData.folder_path) {
          throw new Error("folder_path is required for delete action");
        }
        result = await deleteFolder(imapConfig, requestData.folder_path);
        break;
        
      case 'rename':
        if (!requestData.folder_path || !requestData.new_name) {
          throw new Error("folder_path and new_name are required for rename action");
        }
        result = await renameFolder(imapConfig, requestData.folder_path, requestData.new_name);
        break;
        
      default:
        throw new Error(`Unknown action: ${requestData.action}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Folder ${requestData.action} operation successful`,
        result
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Folder management error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An error occurred during folder management",
        error: error.stack || "Unknown error"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200, // Return 200 even for errors to ensure frontend gets detailed error info
      }
    );
  }
});
