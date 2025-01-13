import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const { messages, teamId } = await req.json();
    const apiKey = req.headers.get('X-OpenAI-Key');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    console.log('Processing chat request with messages:', JSON.stringify(messages));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: relevantContent } = await supabase
      .from('content_embeddings')
      .select('content, metadata')
      .eq('team_id', teamId)
      .limit(5);

    const contextEnhancedMessages = messages.map(msg => {
      if (msg.role === 'system') {
        return {
          ...msg,
          content: `${msg.content}\n\nRelevant context:\n${
            relevantContent?.map(c => c.content).join('\n') || 'No additional context available.'
          }`
        };
      }
      return msg;
    });

    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4",
      streaming: true,
      temperature: 0.7,
    });

    const stream = await chat.stream(contextEnhancedMessages);
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          for await (const chunk of stream) {
            fullContent += chunk.content;
            const message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: chunk.content,
              createdAt: new Date().toISOString()
            };
            
            const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
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