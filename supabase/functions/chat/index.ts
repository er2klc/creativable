
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

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

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get last user message for context search
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    // Suche nach relevanten Kontakten
    console.log('Searching for leads with query:', lastUserMessage.content);
    const { data: relevantLeads, error: leadsError } = await supabase.rpc(
      'match_lead_content',
      {
        p_user_id: userId,
        query_text: lastUserMessage.content,
        match_count: 5
      }
    );

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
    } else {
      console.log('Found relevant leads:', relevantLeads);
    }

    // Get embedding for the last message
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: lastUserMessage.content,
    });
    
    const queryEmbedding = embeddingResponse.data.data[0].embedding;

    // Suche nach relevantem Kontext mit dem Embedding
    console.log('Searching for context with embedding');
    const { data: relevantContext, error: searchError } = await supabase.rpc(
      'match_combined_content',
      {
        query_embedding: JSON.stringify(queryEmbedding), // Convert the array to a string representation
        match_threshold: 0.7,
        match_count: 5,
        p_user_id: userId,
        p_team_id: teamId
      }
    );

    if (searchError) {
      console.error('Error searching for context:', searchError);
    } else {
      console.log('Found relevant context:', relevantContext);
    }
    
    // Build enhanced system message with context
    let enhancedSystemMessage = messages[0].content + "\n\nKontextinformationen:\n";
    
    // Füge Kontaktinformationen hinzu
    if (relevantLeads && relevantLeads.length > 0) {
      enhancedSystemMessage += "\nRelevante Kontakte:\n";
      relevantLeads.forEach(lead => {
        enhancedSystemMessage += `- ${lead.name} (${lead.platform}): ${lead.industry}, Status: ${lead.status}\n`;
        if (lead.notes && lead.notes.length > 0) {
          enhancedSystemMessage += `  Letzte Notizen: ${lead.notes[0]}\n`;
        }
      });
    }

    // Füge weiteren Kontext hinzu
    if (relevantContext && relevantContext.length > 0) {
      enhancedSystemMessage += "\nWeiterer relevanter Kontext:\n";
      relevantContext.forEach(ctx => {
        enhancedSystemMessage += `[${ctx.source}] ${ctx.content}\n`;
      });
    }

    // Update system message with context
    const enhancedMessages = [
      { role: 'system', content: enhancedSystemMessage },
      ...messages.slice(1)
    ];

    console.log('Enhanced system message:', enhancedSystemMessage);

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
