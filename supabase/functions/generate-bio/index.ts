import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Bio Generator Edge Function started")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { role, target_audience, unique_strengths, mission, social_proof, cta_goal, url, preferred_emojis, language } = await req.json()

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!authHeader) {
      throw new Error('No authorization header')
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
    )

    // Get user's OpenAI API key from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key')
      .single()

    if (settingsError || !settings?.openai_api_key) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not found in settings. Please add your API key in the settings page.',
          details: 'Go to Settings -> Integrations -> OpenAI Integration to add your API key.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const prompt = `Create a professional ${language === 'English' ? 'English' : 'German'} bio for a ${role} that is exactly 150 characters long, split into 4 lines (max 40 chars per line). Target audience: ${target_audience}. Strengths: ${unique_strengths}. Mission: ${mission}. Social proof: ${social_proof}. Call-to-action: ${cta_goal}. URL: ${url}. ${preferred_emojis ? `Use these emojis: ${preferred_emojis}` : ''}`

    console.log('Creating OpenAI configuration...')
    const configuration = new Configuration({ apiKey: settings.openai_api_key })
    const openai = new OpenAIApi(configuration)

    console.log('Sending request to OpenAI...')
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    })

    const generatedBio = completion.data.choices[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ bio: generatedBio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response?.data?.error?.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})