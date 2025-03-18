
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface FolderRequest {
  action: 'create' | 'delete' | 'rename' | 'move';
  folder_id?: string;
  new_name?: string;
  path?: string;
  name?: string;
  parent_folder?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData: FolderRequest = await req.json();
    console.log("Folder management request:", requestData);

    // Get auth token
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    
    if (!jwt) {
      throw new Error("Authentication required");
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    // Get user information
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

    // Handle folder actions
    let result;
    switch (requestData.action) {
      case 'create':
        // Create a new folder
        if (!requestData.name) {
          throw new Error("Folder name is required");
        }

        // Generate folder path
        const folderPath = requestData.parent_folder 
          ? `${requestData.parent_folder}/${requestData.name}`
          : requestData.name;

        // Create folder in the database
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
              name: requestData.name,
              path: folderPath,
              type: 'regular',
              total_messages: 0,
              unread_messages: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        );

        if (!createResponse.ok) {
          throw new Error(`Failed to create folder: ${await createResponse.text()}`);
        }

        const folderData = await createResponse.json();
        result = {
          success: true,
          message: "Folder created successfully",
          folder: folderData
        };
        break;

      case 'delete':
        // Delete a folder from the database
        if (!requestData.folder_id) {
          throw new Error("Folder ID is required");
        }

        // First check if folder belongs to user
        const checkResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/email_folders?id=eq.${requestData.folder_id}&user_id=eq.${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": SUPABASE_SERVICE_ROLE_KEY
            }
          }
        );

        const folderCheck = await checkResponse.json();
        
        if (!folderCheck || folderCheck.length === 0) {
          throw new Error("Folder not found or you don't have permission to delete it");
        }

        // Delete folder
        const deleteResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/email_folders?id=eq.${requestData.folder_id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": SUPABASE_SERVICE_ROLE_KEY
            }
          }
        );

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete folder: ${await deleteResponse.text()}`);
        }

        // Delete all emails in this folder
        await fetch(
          `${SUPABASE_URL}/rest/v1/emails?folder=eq.${encodeURIComponent(folderCheck[0].path)}&user_id=eq.${userId}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": SUPABASE_SERVICE_ROLE_KEY
            }
          }
        );

        result = {
          success: true,
          message: "Folder deleted successfully"
        };
        break;

      case 'rename':
        // Rename a folder
        if (!requestData.folder_id || !requestData.new_name) {
          throw new Error("Folder ID and new name are required");
        }

        // First check if folder belongs to user
        const folderResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/email_folders?id=eq.${requestData.folder_id}&user_id=eq.${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": SUPABASE_SERVICE_ROLE_KEY
            }
          }
        );

        const folderToRename = await folderResponse.json();
        
        if (!folderToRename || folderToRename.length === 0) {
          throw new Error("Folder not found or you don't have permission to rename it");
        }

        // Update the folder name
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/email_folders?id=eq.${requestData.folder_id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({
              name: requestData.new_name,
              updated_at: new Date().toISOString()
            })
          }
        );

        if (!updateResponse.ok) {
          throw new Error(`Failed to rename folder: ${await updateResponse.text()}`);
        }

        result = {
          success: true,
          message: "Folder renamed successfully"
        };
        break;

      default:
        throw new Error(`Unsupported action: ${requestData.action}`);
    }

    // Return the result
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      status: 200,
    });

  } catch (error) {
    console.error("Folder management error:", error);
    
    const result = {
      success: false,
      message: "Failed to manage folder",
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
