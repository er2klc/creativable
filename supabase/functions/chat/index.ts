// dateiname: supabase/functions/chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle OPTIONS requests (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Lies das JSON aus dem Request
    const { messages, teamId } = await req.json(); 
    // Bei Bedarf kannst du teamId weiter nutzen, z.B. für Logging

    // Hol dir den OpenAI-API-Key aus dem Header
    const apiKey = req.headers.get("X-OpenAI-Key");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Debug Logging (optional)
    console.log("Processing chat request with messages:", JSON.stringify(messages));

    // Erzeuge ChatOpenAI-Instanz mit Streaming aktiviert
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini", // Oder das gewünschte Model
      streaming: true,          // WICHTIG: Streaming an
      temperature: 0.7,
    });

    // Wir holen uns einen Async-Iterator (Stream) von LangChain
    const langChainStream = await chat.stream(messages);
    const encoder = new TextEncoder();

    // Baue einen ReadableStream für Server-Sent Events
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Lies Stück für Stück (Token) aus dem LangChain-Stream
          for await (const chunk of langChainStream) {
            /**
             * 'chunk' hat das Format:
             * {
             *   content: "Hallo",
             *   // ...evtl. weitere Felder
             * }
             *
             * Wir müssen es ins "OpenAI SSE-Format" umwandeln,
             * damit useChat() es live anzeigen kann.
             */
            const openAiFormatChunk = {
              id: crypto.randomUUID(),               // eine eindeutige ID
              object: "chat.completion.chunk",        // OpenAI-typischer Wert
              created: Math.floor(Date.now() / 1000), // Zeitstempel in Sek.
              model: "gpt-4o-mini",                  // beliebig/optional
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

            // In SSE-Format konvertieren
            const sseMessage = `data: ${JSON.stringify(openAiFormatChunk)}\n\n`;
            // An den Client schicken
            controller.enqueue(encoder.encode(sseMessage));
          }

          // Wenn das Streamen abgeschlossen ist, ein "Abschluss-Chunk" senden
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

          // Stream ordentlich schließen
          controller.close();
        } catch (error) {
          console.error("Error in stream processing:", error);
          controller.error(error);
        }
      },
    });

    // Sende den SSE-Stream als HTTP-Response
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
