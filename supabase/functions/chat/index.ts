import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, teamId, platformId, currentTeamId, userId } = await req.json();
    const apiKey = req.headers.get('x-openai-key');

    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Processing chat request:', { 
      messageCount: messages.length,
      teamId,
      platformId,
      currentTeamId,
      userId,
      timestamp: new Date().toISOString()
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              // Skip "[DONE]" message
              if (line === 'data: [DONE]') {
                controller.enqueue('data: [DONE]\n\n');
                continue;
              }

              // Validate JSON content
              const content = line.substring(6);
              JSON.parse(content);
              
              // Ensure proper SSE format with double newlines
              controller.enqueue(line + '\n\n');
              
              console.log('Processed stream chunk:', {
                timestamp: new Date().toISOString(),
                chunkSize: content.length,
                isValid: true
              });
            } catch (error) {
              console.error('Invalid JSON in stream:', {
                line,
                error: error.message,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      },
    });

    return new Response(
      response.body?.pipeThrough(transformStream),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Chat function error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});