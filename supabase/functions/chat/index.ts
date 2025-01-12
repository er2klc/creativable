import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

console.log('Chat function loaded');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, teamId, platformId, currentTeamId, userId } = await req.json();
    const apiKey = req.headers.get('X-OpenAI-Key');
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      throw new Error('Missing auth header');
    }

    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let contextMessages = [];
    if (messages?.length > 0) {
      const userMessage = messages[messages.length - 1];
      if (userMessage.role === 'user') {
        console.log('Processing message for embeddings:', userMessage.content);
        
        try {
          if (typeof userMessage.content !== 'string' || userMessage.content.trim().length === 0) {
            console.log('Invalid input for embeddings, skipping similarity search');
          } else {
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: userMessage.content,
                model: 'text-embedding-3-small'
              })
            });

            if (!embeddingResponse.ok) {
              throw new Error('Failed to generate embeddings');
            }

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            const { data: similarContent, error } = await supabase.rpc('match_content', {
              query_embedding: embedding,
              match_threshold: 0.5,
              match_count: 5,
              content_type: 'personal'
            });

            if (error) {
              console.error('Error in similarity search:', error);
            } else if (similarContent?.length > 0) {
              console.log('Found similar content:', similarContent.length, 'items');
              contextMessages = similarContent.map(item => ({
                role: 'system',
                content: `Related content: ${item.content}`
              }));
            }
          }
        } catch (error) {
          console.error('Error in embeddings process:', error);
        }
      }
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            ...messages.slice(0, -1),
            ...contextMessages,
            messages[messages.length - 1]
          ],
          stream: true,
        }),
      });

      if (!openAIResponse.ok) {
        const error = await openAIResponse.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const reader = openAIResponse.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              await writer.close();
              break;
            }

            buffer += new TextDecoder().decode(value);
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

              if (trimmedLine.startsWith('data: ')) {
                try {
                  const json = JSON.parse(trimmedLine.slice(5));
                  const content = json.choices[0]?.delta?.content || '';
                  if (content) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({
                      id: crypto.randomUUID(),
                      role: 'assistant',
                      content: content,
                      createdAt: new Date().toISOString()
                    })}\n\n`));
                  }
                } catch (error) {
                  console.error('Error parsing chunk:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          await writer.abort(error);
        }
      };

      processStream();

      return new Response(stream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } catch (error) {
      console.error('Error in OpenAI request:', error);
      throw error;
    }

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
