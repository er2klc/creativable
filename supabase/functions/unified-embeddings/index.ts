import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, contentType, teamId, userId } = await req.json();
    console.log('Processing embedding request:', { action, contentType, teamId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Generate embedding
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-3-small',
      input: content,
    });
    
    const embedding = embeddingResponse.data.data[0].embedding;

    // Store embedding based on content type
    switch (action) {
      case 'store': {
        if (contentType === 'team') {
          const { data, error } = await supabase
            .from('team_content_embeddings')
            .insert({
              team_id: teamId,
              content_type: contentType,
              content: content,
              embedding: embedding,
              metadata: { processed_at: new Date().toISOString() }
            });

          if (error) throw error;
          console.log('Stored team embedding:', data);
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          const { data, error } = await supabase
            .from('content_embeddings')
            .insert({
              content_type: contentType,
              content: content,
              embedding: embedding,
              metadata: { processed_at: new Date().toISOString() }
            });

          if (error) throw error;
          console.log('Stored content embedding:', data);
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
      
      case 'search': {
        const matchThreshold = 0.7;
        const matchCount = 10;

        const { data: results, error } = await supabase.rpc('match_content', {
          query_embedding: embedding,
          match_threshold: matchThreshold,
          match_count: matchCount,
          search_content_type: contentType
        });

        if (error) throw error;
        console.log('Search results:', results);
        return new Response(JSON.stringify({ success: true, results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in unified-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});