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
    let userId: string | null = null;

    // Get Authorization header (for admin)
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: authHeader ? { Authorization: `Bearer ${authHeader}` } : {}, // Nur setzen, wenn vorhanden
        },
      }
    );

    if (authHeader) {
      // Admin: Benutzer aus Authorization-Header ermitteln
      const { data: adminUser, error: adminError } = await supabaseClient.auth.getUser();
      if (adminError || !adminUser) {
        throw new Error('Admin authentication failed');
      }
      userId = adminUser.id;
      console.log('Admin authenticated, user ID:', userId);
    } else {
      // Registrierte Benutzer: Benutzer-ID aus der aktuellen Supabase-Session holen
      const { data: session, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('User not authenticated');
      }
      userId = session.user.id;
      console.log('User authenticated, user ID:', userId);
    }

    if (!userId) {
      throw new Error('Unable to determine user ID');
    }

    // API key aus der settings-Tabelle holen
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      console.error('Error fetching OpenAI API key:', settingsError);
      throw new Error('OpenAI API key not found for user');
    }

    const { role, target_audience, unique_strengths, mission, social_proof, cta_goal, url, preferred_emojis, language } = await req.json();

    const prompt = `
Write a professional ${language === 'English' ? 'English' : 'German'} Instagram bio. 
The bio must:
- Be exactly 150 characters, split into 4 lines.
- Start each line with a relevant emoji.
- Use the following structure:
  1️⃣ Who they are and what they do (e.g., 🚀 Helping coaches achieve success).
  2️⃣ What makes them unique or their mission (e.g., 🌟 Empowering growth through innovation).
  3️⃣ Social proof or achievements (e.g., 🏆 Over 1000+ satisfied clients).
  4️⃣ Call-to-action with a link (e.g., 🔗 Try it free: example.com).

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
