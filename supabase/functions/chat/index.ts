
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";
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

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user's last message
    const userMessage = messages[messages.length - 1].content;

    // Generate embedding for the user's message
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-3-small",
      input: userMessage,
    });

    const embedding = embeddingResponse.data.data[0].embedding;

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

    // Transform the response into a readable stream
    return new Response(response.body, {
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
