import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const VERIFY_TOKEN = "lovable_instagram_webhook_verify_123";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  
  // Handle webhook verification from Meta
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log("Webhook verification request:", { mode, token, challenge });

    // Verify both mode and token as per Meta's requirements
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      // Return ONLY the challenge value as plain text
      return new Response(challenge, { 
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain",
        }
      });
    }

    console.log("Verification failed:", { mode, token });
    return new Response("Verification failed", { 
      status: 403,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
      }
    });
  }

  // Handle actual webhook events
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Received webhook event:", body);

      // Here we'll handle different types of webhook events based on the documentation
      if (body.object === "instagram") {
        const entry = body.entry[0];
        
        // Handle different types of notifications
        if (entry.messaging) {
          console.log("Received messaging event:", entry.messaging[0]);
          // Handle messaging events (messages, reactions, etc.)
        } else if (entry.changes) {
          console.log("Received changes event:", entry.changes[0]);
          // Handle other Instagram updates
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      });
    }
  }

  return new Response("Method not allowed", { 
    status: 405,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain",
    }
  });
});