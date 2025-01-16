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

    console.log("[Bio Generator] Initializing Supabase client...");
    
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

    // Get the user to verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('[Bio Generator] Error getting user:', userError);
      throw new Error('Authentication failed');
    }

    console.log("[Bio Generator] Fetching settings for user:", user.id);
    
    // Get user's OpenAI API key from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key')
      .single();

    if (settingsError) {
      console.error('[Bio Generator] Error fetching settings:', settingsError);
      throw new Error('Failed to fetch user settings');
    }

    if (!settings?.openai_api_key) {
      console.error('[Bio Generator] No OpenAI API key found in settings');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not found',
          details: 'Please add your OpenAI API key in Settings -> Integrations'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log("[Bio Generator] Successfully retrieved OpenAI API key");

    const { role, target_audience, unique_strengths, mission, social_proof, cta_goal, url, preferred_emojis, language } = await req.json();

    const prompt = `
Write a professional ${language === 'English' ? 'English' : 'German'} Instagram bio. 
The bio must:
- Be exactly 150 characters, split into 4 lines
- Start each line with a relevant emoji
- Use the following structure:
  1️⃣ Who they are and what they do
  2️⃣ What makes them unique or their mission
  3️⃣ Social proof or achievements
  4️⃣ Call-to-action with a link

Details:
- Role: ${role}
- Target Audience: ${target_audience}
- Unique Strengths: ${unique_strengths}
- Mission: ${mission}
- Social Proof: ${social_proof}
- Call-to-Action: ${cta_goal}
- URL: ${url}
- Preferred Emojis: ${preferred_emojis || '🚀, 🌟, 🏆, 🔗'}

Generate the bio now, ensuring each line starts with an emoji.
`;

    console.log('[Bio Generator] Creating OpenAI request with prompt:', prompt);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openai_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
      console.error('[Bio Generator] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedBio = data.choices[0]?.message?.content;

    if (!generatedBio) {
      throw new Error('No bio was generated');
    }

    console.log('[Bio Generator] Successfully generated bio');

    // Save the generated bio
    const { error: saveError } = await supabaseClient
      .from('user_bios')
      .upsert({
        user_id: user.id,
        role,
        target_audience,
        unique_strengths,
        mission,
        social_proof,
        cta_goal,
        url,
        preferred_emojis,
        language,
        generated_bio: generatedBio
      });

    if (saveError) {
      console.error('[Bio Generator] Error saving bio:', saveError);
      // Continue even if save fails - we still want to return the generated bio
    }

    return new Response(
      JSON.stringify({ bio: generatedBio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('[Bio Generator] Error:', error);
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