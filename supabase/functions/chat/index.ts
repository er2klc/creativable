/**
 * supabase/functions/chat/index.ts
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // IMPORTANT: streaming = false
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      streaming: false,   // <= Streaming aus
      temperature: 0.7,
    });

    // Ruf das Modell einfach ohne Stream auf:
    const response = await chat.call(messages);

    // Bau ein einfaches JSON, das eine "fertige" Antwort enthält
    const jsonResponse = {
      id: "chatcmpl-" + crypto.randomUUID().slice(0, 8),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gpt-4o-mini",
      choices: [
        {
          message: {
            role: "assistant",
            content: response.text,
          },
          finish_reason: "stop",
        },
      ],
    };

    // Sende diese fertige Antwort OHNE SSE an den Client
    return new Response(JSON.stringify(jsonResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
