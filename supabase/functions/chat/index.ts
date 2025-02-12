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

    // Search for relevant content
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

    // Prepare context
    const context = relevantContent
      ?.map(item => item.content)
      .join('\n\n')
      .slice(0, 3000);

    const updatedMessages = [...messages];
    if (context) {
      updatedMessages[0].content = `${messages[0].content}\n\nRelevanter Kontext:\n${context}`;
    }

    // Get response from OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: updatedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Set up stream transformation
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Generate a consistent message ID for the entire stream
    const messageId = crypto.randomUUID();
    let accumulatedContent = '';
    let buffer = '';

    // Process the stream
    (async () => {
      const reader = response.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Flush any remaining buffer content
            if (buffer) {
              try {
                const lastChunk = buffer.split('\n').filter(line => line.trim().startsWith('data: ')).pop();
                if (lastChunk) {
                  const lastData = JSON.parse(lastChunk.slice(6));
                  if (lastData.choices?.[0]?.delta?.content) {
                    accumulatedContent += lastData.choices[0].delta.content;
                  }
                }
              } catch (e) {
                console.error('Error processing final buffer:', e);
              }
            }
            
            // Send final message
            const finalMessage = {
              id: messageId,
              role: 'assistant',
              content: accumulatedContent
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(finalMessage)}\n\n`));
            await writer.write(encoder.encode('data: [DONE]\n\n'));
            await writer.close();
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete messages from buffer
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in buffer
          buffer = lines[lines.length - 1];
          
          // Process all complete lines
          for (const line of lines.slice(0, -1)) {
            if (!line.trim() || !line.startsWith('data: ')) continue;
            
            try {
              // Remove 'data: ' prefix and parse
              const data = JSON.parse(line.slice(6));
              
              if (!data.choices?.[0]?.delta?.content) continue;

              // Add new content to accumulated content
              accumulatedContent += data.choices[0].delta.content;

              // Create message in the format expected by vercel/ai
              const message = {
                id: messageId,
                role: 'assistant',
                content: accumulatedContent
              };

              // Write the transformed message
              await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
            } catch (error) {
              console.error('Error processing line:', error, 'Line:', line);
              continue;
            }
          }
        }
      } catch (error) {
        console.error('Stream processing error:', error);
        // Ensure we close the writer even if there's an error
        await writer.close();
      }
    })();

    // Return the transformed stream
    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json"
      },
    });
  }
});
