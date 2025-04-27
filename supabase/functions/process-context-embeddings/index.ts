
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.24.1';

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

const validateRequest = (data: ProcessingRequest) => {
  if (!data.userId) throw new Error('userId is required');
  if (!data.contentType) throw new Error('contentType is required');
  if (!data.content) throw new Error('content is required');
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Processing new request`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize OpenAI with proper configuration
    const configuration = new Configuration({
      apiKey: openAiKey,
      baseOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });
    const openai = new OpenAIApi(configuration);

    const requestData: ProcessingRequest = await req.json();
    console.log(`[${requestId}] Received request for user ${requestData.userId}, type ${requestData.contentType}`);

    // Validate request data
    validateRequest(requestData);
    const { userId, contentType, content, metadata, sourceType, sourceId } = requestData;

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
    console.log(`[${requestId}] Content split into ${totalChunks} chunks`);

    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        console.log(`[${requestId}] Processing chunk ${i + 1}/${totalChunks}`);
        
        // Generate embedding with retry logic
        let embedding;
        let retries = 3;
        while (retries > 0) {
          try {
            const embeddingResponse = await openai.createEmbedding({
              model: "text-embedding-3-small",
              input: chunk,
            });
            embedding = embeddingResponse.data.data[0].embedding;
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw error;
            console.log(`[${requestId}] Retry ${3-retries}/3 for chunk ${i + 1}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Store in nexus_context
        const { error: insertError } = await supabase
          .from('nexus_context')
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

        if (insertError) {
          console.error(`[${requestId}] Error inserting chunk ${i + 1}:`, insertError);
          throw insertError;
        }

        results.push({ chunk: i, success: true });
        console.log(`[${requestId}] Successfully processed chunk ${i + 1}/${totalChunks}`);
      } catch (error) {
        console.error(`[${requestId}] Error processing chunk ${i + 1}:`, error);
        results.push({ chunk: i, success: false, error: error.message });
      }
    }

    const successfulChunks = results.filter(r => r.success).length;
    const message = `Processed ${successfulChunks}/${totalChunks} chunks successfully`;
    console.log(`[${requestId}] ${message}`);

    return new Response(
      JSON.stringify({ 
        success: successfulChunks === totalChunks,
        message,
        results,
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-context-embeddings:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        requestId
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
