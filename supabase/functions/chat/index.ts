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
    if (!apiKey) throw new Error("OpenAI API key is required");

    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o",
      streaming: true,
      temperature: 0.7,
    });

    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // One consistent ID for the entire response
    const responseId = "chatcmpl-" + crypto.randomUUID().slice(0, 8);

    let hasEmittedAnything = false;
    let isFirstChunk = true;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of langChainStream) {
            // Skip empty chunks at the start
            if (!chunk.content && !hasEmittedAnything) {
              continue;
            }

            // Step 1: For the first chunk, only send the role
            if (isFirstChunk) {
              isFirstChunk = false;
              hasEmittedAnything = true;

              const firstChunk = {
                id: responseId,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: "gpt-4o",
                choices: [
                  {
                    delta: {
                      role: "assistant",
                      content: ""
                    },
                    index: 0,
                    logprobs: null,
                    finish_reason: null
                  }
                ]
              };

              const firstSse = `data: ${JSON.stringify(firstChunk)}\n\n`;
              controller.enqueue(encoder.encode(firstSse));
            }

            // Step 2: Then send content-only chunks
            if (chunk.content?.trim()) {
              hasEmittedAnything = true;

              const nextChunk = {
                id: responseId,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: "gpt-3.5-turbo",
                choices: [
                  {
                    delta: {
                      content: chunk.content
                    },
                    index: 0,
                    logprobs: null,
                    finish_reason: null
                  }
                ]
              };

              const sse = `data: ${JSON.stringify(nextChunk)}\n\n`;
              controller.enqueue(encoder.encode(sse));
            }
          }

          // Final chunk with finish_reason
          const doneChunk = {
            id: responseId,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "gpt-3.5-turbo",
            choices: [
              {
                delta: {},
                index: 0,
                logprobs: null,
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
