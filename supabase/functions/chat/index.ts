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
      return new Response(JSON.stringify({ error: 'OpenAI API Key is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: 'Failed to get response from OpenAI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let buffer = '';
    let currentContent = '';
    let doneSent = false; // Flag, um zu verhindern, dass [DONE] mehrfach gesendet wird

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Letzte unvollständige Zeile behalten

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6);
          if (data === '[DONE]') {
            if (!doneSent) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              doneSent = true;
            }
            continue;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || '';
            if (content) {
              currentContent += content;
              const message = {
                role: "assistant",
                content: currentContent
              };
              console.log('Sending message to client:', message);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      },
      async flush(controller) {
        if (buffer) {
          try {
            const data = buffer.slice(6);
            if (data && data !== '[DONE]') {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || '';
              if (content) {
                currentContent += content;
                const message = {
                  role: "assistant",
                  content: currentContent
                };
                console.log('Sending message to client:', message);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
              }
            }
          } catch (error) {
            console.error('Error parsing final JSON:', error);
          }
        }
        if (!doneSent) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          doneSent = true;
        }
      }
    });

    return new Response(response.body.pipeThrough(transformStream), {
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
