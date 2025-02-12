
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verarbeitet Inhalte im Hintergrund
async function processContent(supabase: any, content: any) {
  try {
    if (!content.user_settings?.openai_api_key) {
      throw new Error(`No OpenAI API key found for user ${content.user_id}`);
    }

    const openai = new OpenAI({
      apiKey: content.user_settings.openai_api_key,
    });

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content.content,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { error } = await supabase
      .from('content_embeddings')
      .update({ 
        embedding,
        processing_status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', content.id);

    if (error) throw error;
    
    console.log(`Successfully processed content ID: ${content.id}`);
    return { id: content.id, success: true };
  } catch (error) {
    console.error(`Error processing content ID ${content.id}:`, error);
    
    await supabase
      .from('content_embeddings')
      .update({ 
        processing_status: 'error',
        processing_error: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('id', content.id);

    return { id: content.id, success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get unprocessed content
    const { data: unprocessedContent, error: fetchError } = await supabase
      .from('content_embeddings')
      .select(`
        *,
        user_settings:settings!inner(openai_api_key)
      `)
      .is('embedding', null)
      .limit(10);

    if (fetchError) throw fetchError;

    console.log(`Processing ${unprocessedContent?.length || 0} items`);

    // Process all content in parallel
    const results = await Promise.all(
      (unprocessedContent || []).map(content => processContent(supabase, content))
    );

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
