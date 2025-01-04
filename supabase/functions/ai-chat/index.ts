import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user data
    const [
      leadsResult,
      tasksResult,
      settingsResult,
      teamsResult,
      modulesResult
    ] = await Promise.all([
      supabase.from('leads').select('*').eq('user_id', userId),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('settings').select('*').eq('user_id', userId).single(),
      supabase.from('team_members').select('teams (*)').eq('user_id', userId),
      supabase.from('elevate_user_progress').select('lerninhalte (*)').eq('user_id', userId)
    ]);

    // Create context for AI
    const context = {
      leads: leadsResult.data || [],
      tasks: tasksResult.data || [],
      settings: settingsResult.data || {},
      teams: teamsResult.data || [],
      modules: modulesResult.data || []
    };

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant with access to the user's data. Here's what you know about the user:
            - Their leads and contacts: ${JSON.stringify(context.leads)}
            - Their tasks and calendar: ${JSON.stringify(context.tasks)}
            - Their settings and preferences: ${JSON.stringify(context.settings)}
            - Their teams and collaborations: ${JSON.stringify(context.teams)}
            - Their learning progress: ${JSON.stringify(context.modules)}
            
            Use this information to provide personalized and contextual responses. Always be helpful and professional.`
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify({ response: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});