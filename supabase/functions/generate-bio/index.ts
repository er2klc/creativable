import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${authHeader}` },
        },
      }
    );

    // Get user's OpenAI API key from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key')
      .single();

    if (settingsError || !settings?.openai_api_key) {
      console.error('Error fetching OpenAI API key:', settingsError);
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not found in settings. Please add your API key in the settings page.',
          details: 'Go to Settings -> Integrations -> OpenAI Integration to add your API key.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const { role, target_audience, unique_strengths, mission, social_proof, cta_goal, url, preferred_emojis, language } = await req.json();

    const prompt = `Create a professional ${language === 'English' ? 'English' : 'German'} bio that is exactly 150 characters long, split into 4 lines (max 40 chars per line). Target audience: ${target_audience}. Strengths: ${unique_strengths}. Mission: ${mission}. Social proof: ${social_proof}. Call-to-action: ${cta_goal}. URL: ${url}. ${preferred_emojis ? `Use these emojis: ${preferred_emojis}` : ''}`;

    console.log('Creating OpenAI request with prompt:', prompt);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openai_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional bio writer that creates concise and impactful social media bios.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedBio = data.choices[0]?.message?.content;

    if (!generatedBio) {
      throw new Error('No bio was generated');
    }

    return new Response(
      JSON.stringify({ bio: generatedBio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in generate-bio function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response?.data?.error?.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});