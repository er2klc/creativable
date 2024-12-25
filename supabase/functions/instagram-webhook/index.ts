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

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
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

      // Here you can handle different types of webhook events
      // For now, we just log them

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