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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const stream = response.body;
    const reader = stream?.getReader();
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader?.read();
            
            if (done) {
              controller.close();
              break;
            }

            const chunk = new TextDecoder().decode(value);
            const payloads = chunk.split("\n");
            
            for (const payload of payloads) {
              if (payload.trim() === "") continue;
              if (payload.includes("[DONE]")) continue;
              
              if (payload.startsWith("data: ")) {
                try {
                  const data = JSON.parse(payload.replace("data: ", ""));
                  const text = data.choices[0]?.delta?.content || "";
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                } catch (error) {
                  console.error("Error parsing payload:", error);
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream reading error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});