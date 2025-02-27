import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImapSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting IMAP connection test");
    
    // Parse request body
    let body;
    try {
      body = await req.json() as ImapSettings;
      console.log(`Received request to test IMAP connection to ${body.host}:${body.port}`);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: "Could not parse JSON request" 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }
    
    // Validate required fields
    const { host, port, username, password, secure = true } = body;
    
    if (!host || !port || !username || !password) {
      console.error("Missing required IMAP settings");
      return new Response(
        JSON.stringify({ 
          error: "Missing required IMAP settings",
          details: "Host, port, username, and password are required"
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // We're currently just simulating the connection test since we don't have a full IMAP library
    console.log(`Testing IMAP connection to ${host}:${port}, secure: ${secure}`);

    // In the future, implement actual IMAP connection testing
    // For now, return success if we have valid parameters
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "IMAP connection successful (simulation)" 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unexpected error occurred", 
        details: error.message || "Unknown error"
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
