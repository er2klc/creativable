
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const { host, port, username, password, secure, user_id } = await req.json() as SmtpSettings;
    
    // Validate required fields
    if (!host || !port || !username || !password) {
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

    // Create SMTP client with provided settings
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: port,
        tls: secure,
        auth: {
          username: username,
          password: password,
        },
      },
    });

    try {
      // Test connection by connecting and immediately disconnecting
      await client.connect();
      console.log("SMTP connection successful");
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
          details: connectionError.message 
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
      JSON.stringify({ error: "Error processing request", details: error.message }),
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
