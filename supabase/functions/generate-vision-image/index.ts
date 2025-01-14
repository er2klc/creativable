import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

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
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      throw new Error('OpenAI API key not found in settings');
    }

    const { theme } = await req.json();
    if (!theme) {
      throw new Error('Theme is required');
    }

    console.log('Generating image for theme:', theme);
    
    // Optimierter Prompt, der das Thema klar darstellt aber trotzdem den Markenstil beibehält
    const prompt = `
Create a clear and recognizable image of '${theme}' with these specifications:
- The main subject/theme must be immediately recognizable and the central focus
- Use vibrant colors including rainbow gradients as artistic accents, not overwhelming the main subject
- Add subtle colorful swirls and dynamic elements in the background
- Keep the composition balanced with 70% focus on the theme and 30% on artistic style
- Set against a dark background for contrast
- Maintain a modern, high-quality digital art style
- The image should be detailed and professional, suitable for a vision board
`;

    console.log('Generating image with Prompt:', prompt);

    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openai_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const imageData = await openaiResponse.json();
    const imageUrl = imageData.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL was generated');
    }

    console.log('Successfully generated image:', imageUrl);

    return new Response(
      JSON.stringify({ imageUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});