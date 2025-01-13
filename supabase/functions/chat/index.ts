import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "npm:langchain/schema";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, teamId, userId } = await req.json();
    const apiKey = req.headers.get('X-OpenAI-Key');
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      throw new Error('Missing auth header');
    }

    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }

    console.log('Starting chat request with messages:', JSON.stringify(messages));

    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      streaming: true,
      modelName: "gpt-4",
      temperature: 0.7,
    });

    const formattedMessages = messages.map((msg: any) => {
      if (msg.role === 'system') {
        return new SystemMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    });

    const stream = await chat.stream(formattedMessages);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let currentContent = '';
          for await (const chunk of stream) {
            currentContent += chunk.content;
            const message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: currentContent,
              createdAt: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
          }
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      }
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});