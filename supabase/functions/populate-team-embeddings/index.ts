import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Get user's OpenAI API key
    const { data: settings, error: settingsError } = await supabaseClient
      .from('chatbot_settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      console.error('Settings error:', settingsError);
      throw new Error('OpenAI API key not found in settings');
    }

    // Get all teams the user is a member of
    const { data: userTeams, error: teamsError } = await supabaseClient
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      throw teamsError;
    }

    const teamIds = userTeams?.map(t => t.team_id) || [];
    console.log('Processing teams:', teamIds);

    // Get all team content that doesn't have embeddings yet
    const { data: teamContent, error: contentError } = await supabaseClient
      .from('team_posts')
      .select('id, title, content, team_id')
      .in('team_id', teamIds)
      .not('id', 'in', (
        supabaseClient
          .from('content_embeddings')
          .select('content_id')
          .eq('content_type', 'team_post')
      ));

    if (contentError) {
      console.error('Error fetching content:', contentError);
      throw contentError;
    }

    console.log(`Found ${teamContent?.length || 0} items to process`);

    const results = [];
    for (const content of teamContent || []) {
      try {
        // Combine title and content for better context
        const combinedContent = `${content.title}\n\n${content.content}`;
        
        // Get embeddings from OpenAI
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.openai_api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: combinedContent,
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

        // Store embedding
        const { data: storedEmbedding, error: storeError } = await supabaseClient
          .from('content_embeddings')
          .insert({
            content_type: 'team_post',
            content_id: content.id,
            content: combinedContent,
            embedding: embedding,
            team_id: content.team_id,
            metadata: {
              title: content.title,
              type: 'post'
            }
          })
          .select()
          .single();

        if (storeError) {
          console.error('Error storing embedding:', storeError);
          throw storeError;
        }

        results.push({
          id: content.id,
          success: true,
          embedding_id: storedEmbedding.id
        });

        console.log(`Successfully processed content ${content.id}`);
      } catch (error) {
        console.error(`Error processing content ${content.id}:`, error);
        results.push({
          id: content.id,
          success: false,
          error: error.message
        });
      }

      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in populate-embeddings function:', error);
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