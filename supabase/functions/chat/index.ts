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

  console.log("Using final approach with first-chunk role!");

  try {
    const { messages } = await req.json();
    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      streaming: true,
      temperature: 0.7,
    });

    // Rufe LangChain-Stream ab
    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // EINE ID pro Antwort
    const responseId = "chatcmpl-" + crypto.randomUUID().slice(0, 8);

    let hasEmittedContent = false;
    let isFirstChunk = true;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of langChainStream) {
            // Überspringe komplett leere Tokens am Anfang
            if (!chunk.content && !hasEmittedContent) {
              continue;
            }
            // Falls chunk.content "" ist, kannst du es auch skippen
            if (!chunk.content?.trim()) {
              continue;
            }

            hasEmittedContent = true;

            const delta: Record<string, string> = {
              content: chunk.content,
            };

            // Beim allerersten Partial => "assistant"-Rolle hinzufügen
            if (isFirstChunk) {
              delta.role = "assistant";
              isFirstChunk = false;
            }

            const openAiChunk = {
              id: responseId,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: "gpt-3.5-turbo",
              choices: [
                {
                  delta,
                  index: 0
                }
              ]
            };

            // SSE
            const sseMessage = `data: ${JSON.stringify(openAiChunk)}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }

          // Am Ende: STOP-Chunk
          const doneChunk = {
            id: responseId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: "gpt-3.5-turbo",
            choices: [
              {
                delta: {},
                index: 0,
                finish_reason: "stop"
              }
            ]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneChunk)}\n\n`));
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