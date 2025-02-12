
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Get unprocessed content (where embedding is null)
    const { data: unprocessedContent, error: fetchError } = await supabase
      .from('content_embeddings')
      .select('*')
      .is('embedding', null)
      .limit(10);

    if (fetchError) throw fetchError;

    console.log(`Processing ${unprocessedContent?.length || 0} items`);

    const results = [];
    for (const content of unprocessedContent || []) {
      try {
        // Generate embedding
        const embeddingResponse = await openai.createEmbedding({
          model: 'text-embedding-3-small',
          input: content.content,
        });

        const embedding = embeddingResponse.data.data[0].embedding;

        // Update record with embedding
        const { data, error } = await supabase
          .from('content_embeddings')
          .update({ 
            embedding,
            processing_status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', content.id);

        if (error) throw error;
        
        results.push({
          id: content.id,
          success: true
        });

        console.log(`Successfully processed content ID: ${content.id}`);
      } catch (error) {
        console.error(`Error processing content ID ${content.id}:`, error);
        results.push({
          id: content.id,
          success: false,
          error: error.message
        });

        // Update error status
        await supabase
          .from('content_embeddings')
          .update({ 
            processing_status: 'error',
            processing_error: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', content.id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in process-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
