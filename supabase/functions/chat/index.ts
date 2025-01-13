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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Body aus dem Request auslesen
    const { messages } = await req.json();

    // OpenAI-API-Key aus Header holen
    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // ChatOpenAI erstellen - streaming = false
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini", // Dein gewünschtes Model (laut deinem Code)
      streaming: false,         // <--- KEIN Streaming
      temperature: 0.7,
    });

    // Wir rufen das Modell synchron (nicht gestreamt) auf
    const response = await chat.call(messages);

    // => response.text enthält die Antwort des Modells als String

    // Jetzt bauen wir ein JSON, das an das Beispiel von OpenAI angelehnt ist
    const fullResponse = {
      id: "chatcmpl-" + crypto.randomUUID().slice(0, 6), // z.B. "chatcmpl-123abc"
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gpt-4o-mini",  // oder z.B. "gpt-4o-2024-08-06"
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: response.text,
            // Bei OpenAI-Beispielen steht hier "refusal": null,
            // falls es um Policy-Verweigerungen o.Ä. geht.
            refusal: null,
          },
          logprobs: null,
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0, // Nur Platzhalter
        completion_tokens: 0, // Nur Platzhalter
        total_tokens: 0, // Nur Platzhalter
        prompt_tokens_details: {
          cached_tokens: 0,
        },
        completion_tokens_details: {
          reasoning_tokens: 0,
          accepted_prediction_tokens: 0,
          rejected_prediction_tokens: 0,
        },
      },
      system_fingerprint: "fp_" + crypto.randomUUID().slice(0, 5),
    };

    // Diesen JSON-Response senden wir jetzt ohne SSE
    return new Response(JSON.stringify(fullResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
});
