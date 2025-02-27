
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from "https://esm.sh/imapflow@1.0.126";

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

    // Create IMAP client with provided settings
    const client = new ImapFlow({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: username,
        pass: password
      },
      logger: false,
      // Short timeouts for testing
      timeoutConnection: 10000
    });

    try {
      // Test connection by connecting and immediately disconnecting
      await client.connect();
      console.log("IMAP connection successful");
      
      // Try to get mailbox list as additional validation
      const mailboxes = await client.list();
      console.log(`Found ${mailboxes.length} mailboxes`);
      
      // Get inbox count
      const inbox = await client.mailboxOpen('INBOX');
      console.log(`INBOX has ${inbox.exists} messages`);
      
      await client.logout();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "IMAP connection successful",
          mailboxes: mailboxes.length,
          inbox_count: inbox.exists
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
