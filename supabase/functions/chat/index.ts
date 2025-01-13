/**
 * supabase/functions/chat/index.ts
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";

// --------------------------------------------------------
// KORREKTE CORS HEADERS
// --------------------------------------------------------
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
    // Lese JSON-Body aus dem Request
    // (z.B. { messages, teamId }, je nachdem was dein Frontend schickt)
    const { messages, teamId } = await req.json();

    // OpenAI-API-Key aus dem Header
    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // -- Debug-Log im Function-Dashboard --
    console.log("Processing chat request with messages:", JSON.stringify(messages));
    if (teamId) {
      console.log("Team ID:", teamId);
    }

    // --------------------------------------------------------
    // 1) LangChain Chat-Instanz mit streaming=true
    // --------------------------------------------------------
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini", // Oder was du verwenden möchtest
      streaming: true,
      temperature: 0.7,
    });

    // Hier rufen wir .stream() auf, um Token-für-Token zu erhalten.
    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // --------------------------------------------------------
    // 2) Wir erzeugen einen SSE-ReadableStream für den Response
    // --------------------------------------------------------
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Wir lesen asynchron jedes Chunk/Tokens aus dem LangChain-Stream
          for await (const chunk of langChainStream) {
            /**
             * chunk ist ein { content: "...", ... }-Objekt
             * Wir müssen es in das "OpenAI SSE Format" umwandeln, das
             * useChat() standardmäßig erwartet:
             *
             *  {
             *    "id": "<irgendeine-id>",
             *    "object": "chat.completion.chunk",
             *    "created": 1689364731,
             *    "model": "gpt-4",
             *    "choices": [
             *      {
             *        "delta": {
             *          "content": "Hallo"
             *        },
             *        "index": 0,
             *        "finish_reason": null
             *      }
             *    ]
             *  }
             */
            const openAiStyleChunk = {
              id: crypto.randomUUID(),
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: "gpt-4o-mini",
              choices: [
                {
                  delta: {
                    content: chunk.content, // Hier das eigentliche Token
                  },
                  index: 0,
                  finish_reason: null,
                },
              ],
            };

            // Als SSE-Event
            const sseMessage = `data: ${JSON.stringify(openAiStyleChunk)}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }

          // --------------------------------------------------------
          // 3) Abschluss-Chunk senden (finish_reason: "stop")
          // --------------------------------------------------------
          const doneChunk = {
            object: "chat.completion.chunk",
            model: "gpt-4o-mini",
            choices: [
              {
                delta: {},
                index: 0,
                finish_reason: "stop",
              },
            ],
          };

          const doneMessage = `data: ${JSON.stringify(doneChunk)}\n\n`;
          controller.enqueue(encoder.encode(doneMessage));

          // SSE-Stream schließen
          controller.close();

        } catch (error) {
          console.error("Error in stream processing:", error);
          controller.error(error);
        }
      },
    });

    // --------------------------------------------------------
    // 4) Gib den SSE-ReadableStream zurück
    // --------------------------------------------------------
    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
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
