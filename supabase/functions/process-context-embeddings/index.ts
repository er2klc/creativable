
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessingRequest {
  userId: string;
  contentType: string;
  content: string;
  metadata?: Record<string, any>;
  sourceType?: string;
  sourceId?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }));

    const { userId, contentType, content, metadata, sourceType, sourceId }: ProcessingRequest = await req.json();

    console.log(`Processing embedding request for user ${userId}, type ${contentType}`);

    // Create processing status entry
    const { data: statusData, error: statusError } = await supabase
      .from('embedding_processing_status')
      .insert({
        user_id: userId,
        content_type: contentType,
        status: 'processing',
        metadata
      })
      .select()
      .single();

    if (statusError) throw statusError;

    // Function to split content into chunks
    const chunkContent = (text: string, maxLength = 1000): string[] => {
      const sentences = text.split(/[.!?]+/);
      const chunks: string[] = [];
      let currentChunk = '';

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= maxLength) {
          currentChunk += sentence + '. ';
        } else {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence + '. ';
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());
      return chunks;
    };

    // Split content into chunks and process each
    const chunks = chunkContent(content);
    const totalChunks = chunks.length;

    console.log(`Content split into ${totalChunks} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        // Generate embedding
        const embeddingResponse = await openai.createEmbedding({
          model: "text-embedding-3-small",
          input: chunk,
        });

        const [{ embedding }] = embeddingResponse.data.data;

        // Store in nexus_context
        const { error: insertError } = await supabase
          .from('nexus_embeddings')
          .insert({
            user_id: userId,
            context_type: contentType,
            content: chunk,
            embedding,
            metadata,
            source_type: sourceType,
            source_id: sourceId,
            chunk_index: i,
            total_chunks: totalChunks,
            processing_status: 'completed'
          });

        if (insertError) throw insertError;

        console.log(`Successfully processed chunk ${i + 1}/${totalChunks}`);
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        throw error;
      }
    }

    // Update processing status
    await supabase
      .from('embedding_processing_status')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', statusData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${totalChunks} chunks`,
        statusId: statusData.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-context-embeddings:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
