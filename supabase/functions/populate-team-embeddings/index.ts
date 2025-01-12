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

    // Get user's OpenAI API key from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key, company_name, products_services, target_audience, usp, business_description')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      console.error('Settings error:', settingsError);
      throw new Error('OpenAI API key not found in settings');
    }

    const { processPersonalData, processTeamData } = await req.json();
    const results = { personal: [], team: [] };

    // Process personal data
    if (processPersonalData) {
      console.log('Processing personal data for user:', user.id);
      
      const personalInfo = {
        company_name: settings.company_name || '',
        products_services: settings.products_services || '',
        target_audience: settings.target_audience || '',
        usp: settings.usp || '',
        business_description: settings.business_description || '',
      };

      const personalContent = Object.entries(personalInfo)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n\n');

      if (personalContent) {
        try {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.openai_api_key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: personalContent,
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
            .from('content_embeddings')
            .insert({
              content_type: 'personal',
              content_id: user.id,
              content: personalContent,
              embedding: embedding,
              metadata: personalInfo
            })
            .select()
            .single();

          if (storeError) {
            console.error('Error storing personal embedding:', storeError);
            throw storeError;
          }

          results.personal.push({
            success: true,
            embedding_id: storedEmbedding.id
          });

          console.log('Successfully stored personal embedding for user:', user.id);
        } catch (error) {
          console.error('Error processing personal data:', error);
          results.personal.push({
            success: false,
            error: error.message
          });
        }
      }
    }

    // Process team data
    if (processTeamData) {
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

      for (const teamId of teamIds) {
        // Process team posts
        const { data: teamPosts, error: postsError } = await supabaseClient
          .from('team_posts')
          .select('id, title, content, team_id')
          .eq('team_id', teamId);

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
              .from('content_embeddings')
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

            results.team.push({
              id: post.id,
              success: true,
              type: 'post',
              embedding_id: storedEmbedding.id
            });

          } catch (error) {
            console.error(`Error processing post ${post.id}:`, error);
            results.team.push({
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
          .eq('team_id', teamId);

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

            if (!embeddingResponse.ok) {
              const error = await embeddingResponse.json();
              console.error('OpenAI API error:', error);
              throw new Error(`Failed to generate embedding: ${error.error?.message || 'Unknown error'}`);
            }

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            const { data: storedEmbedding, error: storeError } = await supabaseClient
              .from('content_embeddings')
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

            if (storeError) {
              console.error('Error storing embedding:', storeError);
              throw storeError;
            }

            results.team.push({
              id: news.id,
              success: true,
              type: 'news',
              embedding_id: storedEmbedding.id
            });

          } catch (error) {
            console.error(`Error processing news ${news.id}:`, error);
            results.team.push({
              id: news.id,
              success: false,
              type: 'news',
              error: error.message
            });
          }
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