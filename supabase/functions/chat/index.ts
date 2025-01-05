import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openaiApiKey = req.headers.get('x-openai-key');
    if (!openaiApiKey) {
      console.error('OpenAI API Key missing');
      throw new Error('OpenAI API Key is required');
    }

    const { messages, language = 'de' } = await req.json();
    console.log('Processing chat request with messages:', messages);

    const systemMessage = {
      role: 'system',
      content: `Du bist ein freundlicher KI-Assistent. Antworte immer auf ${language === 'de' ? 'Deutsch' : 'English'}.`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [systemMessage, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }

    // Create a TransformStream to handle the data
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = line.slice(6);
              if (data === '[DONE]') {
                console.log('Stream completed');
                return;
              }

              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              
              if (content) {
                const message = {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: content
                };
                console.log('Sending chunk:', message);
                controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
              }
            } catch (error) {
              console.warn('Error parsing line:', line, error);
            }
          }
        }
      }
    });

    // Pipe the response through our transform stream
    const stream = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(transformStream);

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