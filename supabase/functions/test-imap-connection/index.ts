
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
    const { host, port, username, password, secure } = await req.json() as ImapSettings;
    
    // Validate required fields
    if (!host || !port || !username || !password) {
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

    console.log(`Testing IMAP connection to ${host}:${port}, secure: ${secure}`);

    try {
      // Since we don't have a native Deno IMAP client, we'll simulate a connection
      // test by making a TCP socket connection to the server port.
      // This will verify the server is reachable, but not full authentication.
      const conn = await Deno.connect({
        hostname: host,
        port: port,
      });
      
      // We successfully connected to the server
      console.log("IMAP server connection established");
      
      // Close the connection
      conn.close();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "IMAP server is reachable. Note: Full authentication test is not available in this version."
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    } catch (connectionError) {
      console.error("IMAP connection failed:", connectionError);
      return new Response(
        JSON.stringify({ 
          error: "IMAP connection failed", 
          details: connectionError.message || "Could not establish connection to IMAP server"
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
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error processing request", 
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
