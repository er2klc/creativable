
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key, origin, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Expose-Headers": "*"
};

serve(async (req) => {
  console.log("📥 Received request to chat function");
  
  if (req.method === "OPTIONS") {
    console.log("✨ Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { messages, teamId, userId, currentRoute } = await req.json();
    console.log("📝 Request data:", { 
      messageCount: messages?.length, 
      teamId, 
      userId, 
      currentRoute 
    });

    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
      console.error("❌ No OpenAI API key provided");
      throw new Error("OpenAI API key is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Initialize OpenAI client
    console.log("🔄 Initializing OpenAI client");
    const openai = new OpenAI({ apiKey });

    // Get the last user message for context search
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Search for relevant context in embeddings
    console.log("🔍 Searching for relevant context...");
    const { data: relevantContext, error: searchError } = await supabase.rpc(
      'match_user_embeddings',
      {
        query_text: lastUserMessage,
        match_count: 3
      }
    );

    if (searchError) {
      console.error("❌ Error searching embeddings:", searchError);
    }

    // Prepare context from embeddings
    let contextMessage = "";
    if (relevantContext && relevantContext.length > 0) {
      contextMessage = "Relevant context:\n" + relevantContext
        .map((ctx: any) => ctx.content)
        .join("\n---\n");
      
      console.log("📚 Found relevant context:", contextMessage);
      
      // Add context to messages array
      messages.unshift({
        role: "system",
        content: contextMessage
      });
    }

    // Create chat completion
    console.log("🚀 Requesting chat completion...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("✅ Received OpenAI response");
    
    return new Response(
      JSON.stringify({
        content: completion.choices[0]?.message?.content,
        model: completion.model,
        usage: completion.usage
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("❌ Error in chat function:", error);
    
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || "An error occurred processing your request"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
