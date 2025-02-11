
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Get the user's last message
    const userMessage = messages[messages.length - 1].content;

    // Generate embedding for the user's message
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: userMessage,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI Embedding API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Search for relevant content using the embedding
    const { data: relevantContent, error: searchError } = await supabase.rpc(
      'match_user_embeddings',
      {
        p_user_id: userId,
        query_embedding: embedding,
        similarity_threshold: 0.7,
        match_count: 5
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // Prepare context from relevant content
    const context = relevantContent
      ?.map(item => item.content)
      .join('\n\n')
      .slice(0, 3000); // Limit context length

    // Add context to the system message if we have relevant content
    const updatedMessages = [...messages];
    if (context) {
      updatedMessages[0].content = `${messages[0].content}\n\nRelevanter Kontext:\n${context}`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: updatedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '' || line.includes('[DONE]')) continue;
              
              if (line.startsWith('data: ')) {
                try {
                  const json = JSON.parse(line.slice(5));
                  const content = json.choices[0]?.delta?.content;
                  if (content) {
                    // Format the response to match what vercel/ai expects
                    const aiResponse = {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: content,
                      createdAt: new Date(),
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(aiResponse)}\n\n`));
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
