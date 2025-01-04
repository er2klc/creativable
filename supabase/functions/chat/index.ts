import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openaiApiKey = req.headers.get('x-openai-key');
    if (!openaiApiKey) {
      console.error('OpenAI API Key missing');
      throw new Error('OpenAI API Key is required');
    }

    const { messages } = await req.json();
    console.log('Processing chat request with messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }

    // Transform the response into a readable stream
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }

            // Decode the chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Split on double newlines, which denote complete SSE messages
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || ''; // Keep the last incomplete chunk in the buffer

            for (const part of parts) {
              if (part.trim() === '') continue;
              if (part.includes('data: [DONE]')) {
                controller.close();
                return;
              }

              // Only process lines starting with 'data: '
              const lines = part.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const json = JSON.parse(line.slice(6));
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) {
                      console.log('Streaming content:', content);
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch (error) {
                    console.warn('Invalid JSON in line:', line);
                    continue;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});