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

   const prompt = `
You are a professional bio writer specializing in creating concise and engaging Instagram bios in ${language === 'English' ? 'English' : 'German'}. 
Your primary focus is to ensure that **each line begins with a relevant emoji**. Emojis are essential for grabbing attention and conveying emotions. 
Create a bio with the following structure:

1️⃣ **Line 1**: Clearly state who the user is and what they do. Start with an emoji that reflects their profession or role.
2️⃣ **Line 2**: Highlight what makes them unique, their mission, or values. Use an emoji that represents uniqueness or purpose.
3️⃣ **Line 3 (optional)**: Include social proof, achievements, or certifications. Use emojis that indicate success or credibility.
4️⃣ **Line 4**: Provide a compelling call-to-action (CTA) with a link. Use attention-grabbing emojis to encourage engagement.

Here is the user information:
- Role: ${role}
- Target Audience: ${target_audience}
- Unique Strengths: ${unique_strengths}
- Mission: ${mission}
- Social Proof: ${social_proof}
- Call-to-Action (CTA): ${cta_goal}
- URL: ${url}
- Preferred Emojis: ${preferred_emojis}

**Key Requirements**:
- Each line must start with an emoji.
- Emojis must match the tone and content of the line.
- If no preferred emojis are provided, choose emojis that are universally recognized and appropriate for the line content.

**Example structure**:
1️⃣ 🚀 Helping coaches achieve success
2️⃣ 🌟 Empowering growth through innovation
3️⃣ 🏆 Over 1000+ users growing with us
4️⃣ 🔗 Try it free: example.com

Now generate a 150-character bio using the structure above. Ensure it is split into 4 lines, each starting with an emoji. The tone must be professional yet engaging.
`;

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
