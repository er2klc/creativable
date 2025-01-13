import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1/dist/module/index.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User auth error:', userError);
      throw new Error('Invalid authorization token');
    }

    // Get user's OpenAI API key from chatbot_settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('chatbot_settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      console.error('Settings error:', settingsError);
      throw new Error('OpenAI API key not found in settings');
    }

    const { contentType, contentId, content, metadata, teamId } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    console.log('Processing content:', { contentType, contentId, teamId });

    // Get embeddings from OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openai_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content,
        model: 'text-embedding-3-small'
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate embedding: ${error.error?.message || 'Unknown error'}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Store embedding in database
    const { data, error } = await supabaseClient
      .from('content_embeddings')
      .insert({
        content_type: contentType,
        content_id: contentId,
        content: content,
        embedding: embedding,
        metadata: metadata || {},
        team_id: teamId
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing embedding:', error);
      throw error;
    }

    console.log('Successfully stored embedding for content:', contentId);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in manage-embeddings function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Please make sure you have set up your OpenAI API key in the settings'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});