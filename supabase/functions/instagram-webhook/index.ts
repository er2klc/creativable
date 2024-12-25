import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VERIFY_TOKEN = 'lovable_instagram_webhook_verify_123';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'GET') {
    // Handle webhook verification from Meta
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log("Webhook verification request received:", {
      mode,
      token,
      challenge,
      fullUrl: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      // Return ONLY the challenge value as plain text
      return new Response(challenge, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
        },
      });
    }

    console.log("Webhook verification failed:", { mode, token });
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log("Received webhook event:", body);

      if (body.object === "instagram") {
        const entry = body.entry[0];
        
        // Handle messaging events
        if (entry.messaging) {
          const messaging = entry.messaging[0];
          
          // Handle different types of messages
          if (messaging.message) {
            console.log("Received message:", messaging.message);
            // Handle text messages, attachments, etc.
          }
          
          if (messaging.reaction) {
            console.log("Received reaction:", messaging.reaction);
            // Handle message reactions
          }
          
          if (messaging.read) {
            console.log("Message read event:", messaging.read);
            // Handle read receipts
          }
        }

        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({ error: "Unsupported webhook object type" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});