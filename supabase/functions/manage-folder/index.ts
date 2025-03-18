
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
  },
  logger: boolean;
  tls: {
    rejectUnauthorized: boolean;
  };
  connectionTimeout: number;
  greetTimeout: number;
  socketTimeout: number;
}

interface FolderManagementOptions {
  action: 'create' | 'delete' | 'rename';
  folderName?: string;
  folderPath?: string;
  newName?: string;
}

async function createFolder(
  imapSettings: ImapSettings,
  folderName: string,
  retryCount = 0
): Promise<{ success: boolean; message?: string }> {
  const client = new ImapFlow(imapSettings);
  
  try {
    await client.connect();
    console.log(`Connected to IMAP server, creating folder: ${folderName}`);
    
    // Create the folder
    await client.mailboxCreate(folderName);
    console.log(`Successfully created folder: ${folderName}`);
    
    await client.logout();
    
    return {
      success: true
    };
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error);
    
    // Try with different settings if this is the first failure
    if (retryCount === 0) {
      const newSettings = {
        ...imapSettings,
        secure: !imapSettings.secure,
        port: imapSettings.secure ? 143 : 993,
        tls: {
          ...imapSettings.tls,
          rejectUnauthorized: false
        }
      };
      
      return createFolder(newSettings, folderName, retryCount + 1);
    }
    
    return {
      success: false,
      message: error.message || "Failed to create folder"
    };
  } finally {
    if (client.usable) {
      client.close();
    }
  }
}

async function deleteFolder(
  imapSettings: ImapSettings,
  folderPath: string,
  retryCount = 0
): Promise<{ success: boolean; message?: string }> {
  const client = new ImapFlow(imapSettings);
  
  try {
    await client.connect();
    console.log(`Connected to IMAP server, deleting folder: ${folderPath}`);
    
    // Delete the folder
    await client.mailboxDelete(folderPath);
    console.log(`Successfully deleted folder: ${folderPath}`);
    
    await client.logout();
    
    return {
      success: true
    };
  } catch (error) {
    console.error(`Error deleting folder ${folderPath}:`, error);
    
    // Try with different settings if this is the first failure
    if (retryCount === 0) {
      const newSettings = {
        ...imapSettings,
        secure: !imapSettings.secure,
        port: imapSettings.secure ? 143 : 993,
        tls: {
          ...imapSettings.tls,
          rejectUnauthorized: false
        }
      };
      
      return deleteFolder(newSettings, folderPath, retryCount + 1);
    }
    
    return {
      success: false,
      message: error.message || "Failed to delete folder"
    };
  } finally {
    if (client.usable) {
      client.close();
    }
  }
}

async function renameFolder(
  imapSettings: ImapSettings,
  folderPath: string,
  newName: string,
  retryCount = 0
): Promise<{ success: boolean; message?: string }> {
  const client = new ImapFlow(imapSettings);
  
  try {
    await client.connect();
    console.log(`Connected to IMAP server, renaming folder: ${folderPath} to ${newName}`);
    
    // Rename the folder
    await client.mailboxRename(folderPath, newName);
    console.log(`Successfully renamed folder from ${folderPath} to ${newName}`);
    
    await client.logout();
    
    return {
      success: true
    };
  } catch (error) {
    console.error(`Error renaming folder ${folderPath} to ${newName}:`, error);
    
    // Try with different settings if this is the first failure
    if (retryCount === 0) {
      const newSettings = {
        ...imapSettings,
        secure: !imapSettings.secure,
        port: imapSettings.secure ? 143 : 993,
        tls: {
          ...imapSettings.tls,
          rejectUnauthorized: false
        }
      };
      
      return renameFolder(newSettings, folderPath, newName, retryCount + 1);
    }
    
    return {
      success: false,
      message: error.message || "Failed to rename folder"
    };
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
    let requestData: FolderManagementOptions;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify(requestData));
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid request data" 
        }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Validate request data
    if (!requestData.action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required 'action' field" 
        }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Get the user's JWT from the request
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');

    if (!jwt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Authentication required" 
        }),
        { 
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing Supabase environment variables" 
        }),
        { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to get user information" 
        }),
        { 
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No IMAP settings found for this user" 
        }),
        { 
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Configure IMAP client
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
        rejectUnauthorized: false
      },
      connectionTimeout: 30000,
      greetTimeout: 15000,
      socketTimeout: 30000
    };

    let result;
    
    // Perform the requested action
    switch (requestData.action) {
      case 'create':
        if (!requestData.folderName) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Missing required 'folderName' field" 
            }),
            { 
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
        
        result = await createFolder(imapConfig, requestData.folderName);
        break;
        
      case 'delete':
        if (!requestData.folderPath) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Missing required 'folderPath' field" 
            }),
            { 
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
        
        result = await deleteFolder(imapConfig, requestData.folderPath);
        break;
        
      case 'rename':
        if (!requestData.folderPath || !requestData.newName) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Missing required 'folderPath' or 'newName' field" 
            }),
            { 
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
        
        result = await renameFolder(imapConfig, requestData.folderPath, requestData.newName);
        break;
        
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Invalid action: ${requestData.action}` 
          }),
          { 
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
    }

    // After successful folder operation, also sync the folders
    if (result.success) {
      try {
        // Sync folders to update the database
        const syncResponse = await fetch(
          "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-folders",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${jwt}`,
              "Accept": "application/json"
            }
          }
        );
        
        if (!syncResponse.ok) {
          console.warn("Folder sync after management operation failed, but operation was successful");
        }
      } catch (syncError) {
        console.error("Error syncing folders after management operation:", syncError);
      }
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Folder management error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to perform folder operation",
        error: error.message
      }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
