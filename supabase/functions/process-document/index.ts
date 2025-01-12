import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get user's OpenAI API key
    const { data: settings, error: settingsError } = await supabase
      .from('chatbot_settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      throw new Error('OpenAI API key not found');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const sourceType = formData.get('sourceType');

    if (!file || !title || !sourceType) {
      throw new Error('Missing required fields');
    }

    // Upload file to storage
    const fileExt = (file as File).name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Create document record
    const { data: document, error: documentError } = await supabase
      .from('user_documents')
      .insert({
        user_id: user.id,
        title: title,
        source_type: sourceType,
        file_path: filePath,
      })
      .select()
      .single();

    if (documentError || !document) {
      throw documentError;
    }

    // Extract text content (simplified for now)
    const text = await (file as File).text();
    
    // Split into chunks (simplified - you might want to use a more sophisticated chunking strategy)
    const chunks = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    
    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim();
      if (!chunk) continue;

      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openai_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: chunk,
          model: "text-embedding-ada-002"
        }),
      });

      const embeddingData = await embeddingResponse.json();
      
      if (!embeddingData.data?.[0]?.embedding) {
        console.error('Failed to generate embedding for chunk:', chunk);
        continue;
      }

      // Store chunk and its embedding
      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert({
          document_id: document.id,
          chunk_index: i,
          content: chunk,
          embedding: embeddingData.data[0].embedding,
          tokens: chunk.split(/\s+/).length, // Simple token count estimation
        });

      if (chunkError) {
        console.error('Failed to store chunk:', chunkError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});