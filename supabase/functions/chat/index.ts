import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "npm:@langchain/core/messages";

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
      modelName: "gpt-4o-mini",
      streaming: true,
      temperature: 0.7,
    });

    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // Generate a consistent ID for the entire response
    const responseId = "chatcmpl-" + crypto.randomUUID().slice(0, 8);
    const timestamp = Math.floor(Date.now() / 1000);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // First chunk always includes role
          const firstChunk = {
            id: responseId,
            object: "chat.completion.chunk",
            created: timestamp,
            model: "gpt-4o-mini",
            choices: [{
              delta: {
                role: "assistant",
                content: ""
              },
              index: 0,
              logprobs: null,
              finish_reason: null
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(firstChunk)}\n\n`));

          // Stream content chunks
          for await (const chunk of langChainStream) {
            if (chunk.content?.trim()) {
              const contentChunk = {
                id: responseId,
                object: "chat.completion.chunk",
                created: timestamp,
                model: "gpt-4o-mini",
                choices: [{
                  delta: {
                    content: chunk.content
                  },
                  index: 0,
                  logprobs: null,
                  finish_reason: null
                }]
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentChunk)}\n\n`));
            }
          }

          // Final chunk with finish_reason
          const finalChunk = {
            id: responseId,
            object: "chat.completion.chunk",
            created: timestamp,
            model: "gpt-4o-mini",
            choices: [{
              delta: {},
              index: 0,
              logprobs: null,
              finish_reason: "stop"
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
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