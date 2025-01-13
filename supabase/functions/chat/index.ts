import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query relevant content from the database directly
    const { data: relevantContent } = await supabase
      .from('content_embeddings')
      .select('content, metadata')
      .eq('team_id', teamId)
      .limit(5);

    // Add context to the system message
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

    // Set up streaming chat
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o",
      streaming: true,
      temperature: 0.7,
    });

    // Create response stream
    const stream = await chat.stream(contextEnhancedMessages);

    // Set up streaming response
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