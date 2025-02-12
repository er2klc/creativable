
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key, origin, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Expose-Headers": "*"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { messages, teamId, userId } = await req.json();
    const apiKey = req.headers.get("X-OpenAI-Key");
    
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get last user message for context search
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    // Search for relevant context using the combined search function
    const { data: relevantContext, error: searchError } = await supabase.rpc(
      'match_combined_content',
      {
        query_embedding: lastUserMessage.content,
        match_threshold: 0.7,
        match_count: 5,
        p_user_id: userId,
        p_team_id: teamId
      }
    );

    if (searchError) {
      console.error('Error searching for context:', searchError);
    }
    
    // Build enhanced system message with context
    let enhancedSystemMessage = messages[0].content + "\n\nRelevant context:\n";
    if (relevantContext && relevantContext.length > 0) {
      enhancedSystemMessage += relevantContext
        .map(ctx => `[${ctx.source}] ${ctx.content}`)
        .join("\n");
    }

    // Update system message with context
    const enhancedMessages = [
      { role: 'system', content: enhancedSystemMessage },
      ...messages.slice(1)
    ];

    // Get response from OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-0125-preview",
        messages: enhancedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const messageId = crypto.randomUUID();
    let accumulatedContent = '';

    (async () => {
      const reader = response.body!.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Send the final message
            const finalMessage = {
              id: messageId,
              role: 'assistant',
              content: accumulatedContent,
              done: true
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(finalMessage)}\n\n`));
            await writer.write(encoder.encode('data: [DONE]\n\n'));
            await writer.close();
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              
              if (delta) {
                accumulatedContent += delta;
                // Send only the delta
                const message = {
                  id: messageId,
                  role: 'assistant',
                  delta: delta
                };
                await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
              }
            } catch (error) {
              console.error('Stream processing error:', error);
              continue;
            }
          }
        }
      } catch (error) {
        console.error('Stream error:', error);
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json"
      },
    });
  }
});
