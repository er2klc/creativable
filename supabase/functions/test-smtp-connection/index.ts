import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  from_email?: string;
  from_name?: string;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting SMTP connection test");
    
    // Parse request body
    let body;
    try {
      body = await req.json() as SmtpSettings;
      console.log(`Received request to test SMTP connection to ${body.host}:${body.port}`);
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
      console.error("Missing required SMTP settings");
      return new Response(
        JSON.stringify({ 
          error: "Missing required SMTP settings",
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

    console.log(`Testing SMTP connection to ${host}:${port}, secure: ${secure}`);

    try {
      // Create SMTP client
      const client = new SmtpClient();
      
      // Connect to the server with appropriate security settings
      if (secure) {
        await client.connectTLS({
          hostname: host,
          port: port,
          username: username,
          password: password,
        });
      } else {
        await client.connect({
          hostname: host,
          port: port,
          username: username,
          password: password,
        });
      }
      
      console.log("SMTP connection successful");
      
      // Close the connection
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true, message: "SMTP connection successful" }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    } catch (connectionError) {
      console.error("SMTP connection failed:", connectionError);
      return new Response(
        JSON.stringify({ 
          error: "SMTP connection failed", 
          details: connectionError.message || "Could not establish SMTP connection"
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
