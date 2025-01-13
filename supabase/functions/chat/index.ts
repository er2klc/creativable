/**
 * supabase/functions/chat/index.ts
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-openai-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, teamId } = await req.json();
    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    console.log("Processing chat request with messages:", JSON.stringify(messages));
    if (teamId) {
      console.log("Team ID:", teamId);
    }

    // 1) Erzeuge eine ChatOpenAI-Instanz mit streaming
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      streaming: true,
      temperature: 0.7,
    });

    // Starte den LangChain-Stream
    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // **Erzeuge eine konstante ID** für alle Partials
    const responseId = crypto.randomUUID();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let hasEmittedContent = false;

          for await (const chunk of langChainStream) {
            // chunk.content könnte am Anfang leer sein
            if (!chunk.content && !hasEmittedContent) {
              // Falls das erste Token leer ist, kann man es skippen.
              // Optional: Wenn du es nicht skippen willst, lass das if einfach weg.
              continue;
            }
            hasEmittedContent = true;

            // 2) Baue den SSE-Chunk
            const openAiStyleChunk = {
              // **immer dieselbe** ID, nicht pro Token neu
              id: responseId, 
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: "gpt-4o-mini",
              choices: [
                {
                  delta: {
                    // Partial-Token
                    content: chunk.content,
                  },
                  index: 0,
                  finish_reason: null,
                },
              ],
            };

            const sseMessage = `data: ${JSON.stringify(openAiStyleChunk)}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }

          // 3) Abschluss-Chunk mit finish_reason = "stop"
          const doneChunk = {
            id: responseId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
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
          controller.close();
        } catch (error) {
          console.error("Error in stream processing:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
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
