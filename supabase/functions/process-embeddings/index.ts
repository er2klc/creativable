
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import OpenAI from "https://esm.sh/openai@4.28.0";

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

    // Get unprocessed content (where embedding is null)
    const { data: unprocessedContent, error: fetchError } = await supabase
      .from('content_embeddings')
      .select('*, settings:user_id(openai_api_key)')
      .is('embedding', null)
      .limit(10);

    if (fetchError) throw fetchError;

    console.log(`Processing ${unprocessedContent?.length || 0} items`);

    const results = [];
    for (const content of unprocessedContent || []) {
      try {
        // Get user's OpenAI API key from settings
        if (!content.settings?.openai_api_key) {
          throw new Error(`No OpenAI API key found for user ${content.user_id}`);
        }

        // Initialize OpenAI with user's API key
        const openai = new OpenAI({
          apiKey: content.settings.openai_api_key,
        });

        // Generate embedding
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: content.content,
        });

        const embedding = embeddingResponse.data[0].embedding;

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
