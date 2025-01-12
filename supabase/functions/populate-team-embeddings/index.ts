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

    const results = {
      teams: [],
      documents: [],
      learningContent: []
    };

    // Process team content
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

    // Process team posts
    for (const teamId of teamIds) {
      const { data: teamPosts, error: postsError } = await supabaseClient
        .from('team_posts')
        .select('id, title, content, team_id')
        .eq('team_id', teamId)
        .not('id', 'in', (
          supabaseClient
            .from('team_content_embeddings')
            .select('content_id')
            .eq('content_type', 'team_post')
        ));

      if (postsError) {
        console.error(`Error fetching posts for team ${teamId}:`, postsError);
        continue;
      }

      for (const post of teamPosts || []) {
        try {
          const combinedContent = `${post.title}\n\n${post.content}`;
          
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

          const { data: storedEmbedding, error: storeError } = await supabaseClient
            .from('team_content_embeddings')
            .insert({
              team_id: teamId,
              content_type: 'team_post',
              content_id: post.id,
              content: combinedContent,
              embedding: embedding,
              metadata: {
                title: post.title,
                type: 'post'
              }
            })
            .select()
            .single();

          if (storeError) {
            console.error('Error storing embedding:', storeError);
            throw storeError;
          }

          results.teams.push({
            id: post.id,
            success: true,
            type: 'post',
            embedding_id: storedEmbedding.id
          });

        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error);
          results.teams.push({
            id: post.id,
            success: false,
            type: 'post',
            error: error.message
          });
        }
      }

      // Process team news
      const { data: teamNews, error: newsError } = await supabaseClient
        .from('team_news')
        .select('id, title, content, team_id')
        .eq('team_id', teamId)
        .not('id', 'in', (
          supabaseClient
            .from('team_content_embeddings')
            .select('content_id')
            .eq('content_type', 'team_news')
        ));

      if (newsError) {
        console.error(`Error fetching news for team ${teamId}:`, newsError);
        continue;
      }

      for (const news of teamNews || []) {
        try {
          const combinedContent = `${news.title}\n\n${news.content}`;
          
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

          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;

          const { data: storedEmbedding, error: storeError } = await supabaseClient
            .from('team_content_embeddings')
            .insert({
              team_id: teamId,
              content_type: 'team_news',
              content_id: news.id,
              content: combinedContent,
              embedding: embedding,
              metadata: {
                title: news.title,
                type: 'news'
              }
            })
            .select()
            .single();

          if (storeError) throw storeError;

          results.teams.push({
            id: news.id,
            success: true,
            type: 'news',
            embedding_id: storedEmbedding.id
          });

        } catch (error) {
          console.error(`Error processing news ${news.id}:`, error);
          results.teams.push({
            id: news.id,
            success: false,
            type: 'news',
            error: error.message
          });
        }
      }
    }

    // Process user documents
    const { data: userDocs, error: docsError } = await supabaseClient
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .not('id', 'in', (
        supabaseClient
          .from('document_chunks')
          .select('document_id')
      ));

    if (!docsError && userDocs) {
      for (const doc of userDocs) {
        try {
          // For documents, we might want to process them in chunks
          // This is a simplified version that treats the whole document as one chunk
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.openai_api_key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: doc.title, // In a real implementation, we'd process the actual document content
              model: 'text-embedding-3-small'
            }),
          });

          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;

          const { data: storedChunk, error: chunkError } = await supabaseClient
            .from('document_chunks')
            .insert({
              document_id: doc.id,
              content: doc.title,
              embedding: embedding,
              chunk_index: 0,
              tokens: 0 // You might want to calculate actual tokens
            })
            .select()
            .single();

          if (chunkError) throw chunkError;

          results.documents.push({
            id: doc.id,
            success: true,
            chunk_id: storedChunk.id
          });

        } catch (error) {
          console.error(`Error processing document ${doc.id}:`, error);
          results.documents.push({
            id: doc.id,
            success: false,
            error: error.message
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
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