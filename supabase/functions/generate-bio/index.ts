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
    // Get auth token from request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'Authorization header is missing' }),
        { headers: corsHeaders, status: 401 },
      );
    }

    // Initialize Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user's session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User session not found' }),
        { headers: corsHeaders, status: 401 },
      );
    }

    console.log('User authenticated:', user.id);

    // Fetch user's OpenAI API key
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      console.error('Error fetching OpenAI API key:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve OpenAI API key from settings' }),
        { headers: corsHeaders, status: 500 },
      );
    }

    if (!settings?.openai_api_key) {
      console.error('OpenAI API key not found in settings for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is missing' }),
        { headers: corsHeaders, status: 403 },
      );
    }

    const openaiApiKey = settings.openai_api_key;

    // Get request body
    const requestBody = await req.json();
    const { 
      role, 
      target_audience, 
      unique_strengths, 
      mission, 
      social_proof, 
      cta_goal, 
      url, 
      preferred_emojis, 
      language 
    } = requestBody;

    console.log('Generating bio with parameters:', {
      role,
      target_audience,
      language,
    });

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
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
            content: prompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` }),
        { headers: corsHeaders, status: 500 },
      );
    }

    const data = await response.json();
    const generatedBio = data.choices[0]?.message?.content;

    if (!generatedBio) {
      console.error('No bio generated');
      return new Response(
        JSON.stringify({ error: 'No bio was generated' }),
        { headers: corsHeaders, status: 500 },
      );
    }

    console.log('Bio generated successfully:', generatedBio);

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
        generated_bio: generatedBio,
      }, {
        onConflict: 'user_id',
      });

    if (saveError) {
      console.error('Error saving bio:', saveError);
    }

    return new Response(
      JSON.stringify({ bio: generatedBio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Error in generate-bio function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { headers: corsHeaders, status: 500 },
    );
  }
});
