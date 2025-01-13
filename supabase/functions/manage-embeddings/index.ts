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
    const { content_type, content_id, content, team_id } = await req.json();
    console.log('Received request:', { content_type, content_id, content, team_id });

    // Validate required fields
    if (!content_type || !content_id || !content) {
      throw new Error('Missing required fields');
    }

    // Create embedding
    const embedding = await createEmbedding(content);
    console.log('Created embedding');

    // Store in appropriate table based on content type
    if (content_type === 'team') {
      await storeTeamEmbedding(content_type, content_id, content, embedding, team_id);
    } else if (content_type === 'personal') {
      await storePersonalEmbedding(content_type, content_id, content, embedding);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in manage-embeddings:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createEmbedding(text: string) {
  // Implementation for creating embeddings
  return [];  // Placeholder
}

async function storeTeamEmbedding(
  content_type: string,
  content_id: string,
  content: string,
  embedding: number[],
  team_id: string
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  await supabase.from('team_content_embeddings').insert({
    content_type,
    content_id,
    content,
    embedding,
    team_id,
  });
}

async function storePersonalEmbedding(
  content_type: string,
  content_id: string,
  content: string,
  embedding: number[]
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  await supabase.from('content_embeddings').insert({
    content_type,
    content_id,
    content,
    embedding,
  });
}