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
      .select('openai_api_key')
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
      
      // Get all user's personal data
      const { data: personalData, error: personalError } = await supabaseClient
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (personalError) {
        console.error('Error fetching personal data:', personalError);
        throw personalError;
      }

      // Get user's tasks
      const { data: tasks, error: tasksError } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Get user's leads
      const { data: leads, error: leadsError } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('user_id', user.id);

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
      }

      const personalContent = {
        settings: personalData,
        tasks: tasks || [],
        leads: leads || []
      };

      try {
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.openai_api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: JSON.stringify(personalContent),
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
            content: JSON.stringify(personalContent),
            embedding: embedding,
            metadata: personalContent
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
        try {
          // Get comprehensive team data
          const { data: teamData, error: teamError } = await supabaseClient
            .from('teams')
            .select(`
              *,
              team_members (
                id,
                role
              ),
              team_calendar_events (
                id,
                title,
                description,
                start_time,
                end_time
              ),
              team_posts (
                id,
                title,
                content
              ),
              team_news (
                id,
                title,
                content
              )
            `)
            .eq('id', teamId)
            .single();

          if (teamError) {
            console.error(`Error fetching team data for ${teamId}:`, teamError);
            continue;
          }

          const combinedTeamContent = {
            id: teamData.id,
            name: teamData.name,
            description: teamData.description,
            memberCount: teamData.team_members?.length || 0,
            events: teamData.team_calendar_events || [],
            posts: teamData.team_posts || [],
            news: teamData.team_news || []
          };

          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.openai_api_key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: JSON.stringify(combinedTeamContent),
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
              content_type: 'team',
              content_id: teamId,
              content: JSON.stringify(combinedTeamContent),
              embedding: embedding,
              metadata: combinedTeamContent
            })
            .select()
            .single();

          if (storeError) {
            console.error('Error storing team embedding:', storeError);
            throw storeError;
          }

          results.team.push({
            id: teamId,
            success: true,
            embedding_id: storedEmbedding.id
          });

          console.log(`Successfully stored team embedding for team ${teamId}`);
        } catch (error) {
          console.error(`Error processing team ${teamId}:`, error);
          results.team.push({
            id: teamId,
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