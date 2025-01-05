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

    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let accumulatedContent = '';
    let doneMessageSent = false;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (!doneMessageSent) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                doneMessageSent = true;
              }
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.trim() === 'data: [DONE]') {
                if (!doneMessageSent) {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  doneMessageSent = true;
                }
                continue;
              }

              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6);
                  const json = JSON.parse(jsonStr);
                  const content = json.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    accumulatedContent += content;
                    const message = {
                      role: "assistant",
                      content: accumulatedContent,
                    };
                    
                    console.log(`Streaming: ${JSON.stringify(message)}`);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
                  }
                } catch (error) {
                  console.warn('Invalid JSON in line:', line, error);
                  continue;
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