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

  console.log("Using CONSTANT ID approach - v2!");  // Updated log to verify new deployment

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

    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      streaming: true,
      temperature: 0.7,
    });

    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // Generate one constant ID for the entire response
    const responseId = crypto.randomUUID();
    console.log("Generated constant response ID:", responseId); // Log the ID we'll use
    let hasEmittedContent = false;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of langChainStream) {
            // Skip empty content blocks if nothing has been emitted yet
            if (!chunk.content && !hasEmittedContent) {
              console.log("Skipping empty initial chunk");
              continue;
            }
            hasEmittedContent = true;

            const openAiStyleChunk = {
              id: responseId, // Using the same ID for all chunks
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

            console.log("Sending chunk with ID:", responseId); // Log each chunk's ID to verify consistency
            const sseMessage = `data: ${JSON.stringify(openAiStyleChunk)}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }

          // Final chunk with the same ID
          const doneChunk = {
            id: responseId, // Same ID here too
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
          
          console.log("Sending final chunk with ID:", responseId);
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