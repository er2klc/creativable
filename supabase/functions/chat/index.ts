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

  console.log("Using CONSTANT ID approach!");  // <--- Eindeutiger Log

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

    // ChatOpenAI mit streaming aktiv
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      streaming: true,
      temperature: 0.7,
    });

    // Hole asynchrone Tokens
    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // Eine feste ID pro Komplette-Antwort
    const responseId = crypto.randomUUID();
    let hasEmittedContent = false;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of langChainStream) {
            // Überspringe leere content-Blöcke, wenn noch nichts gesendet wurde
            if (!chunk.content && !hasEmittedContent) {
              continue;
            }
            hasEmittedContent = true;

            const openAiStyleChunk = {
              // immer dieselbe ID!
              id: responseId,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: "gpt-4o-mini",
              choices: [
                {
                  delta: {
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

          // Abschluss-Chunk
          const doneChunk = {
            // wieder dieselbe ID
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});