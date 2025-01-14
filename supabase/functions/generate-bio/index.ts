import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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
    } = await req.json()

    const prompt = `Generate a PROFESSIONAL and IMPACTFUL Instagram bio.
    CRITICAL: Format in exactly 4 lines, with each line under 40 characters.
    Total bio must be under 150 characters including line breaks.

    Follow this structure STRICTLY:
    Line 1: Role and main value: ${role}
    Line 2: Target and unique strength: ${target_audience}, ${unique_strengths}
    Line 3: Social proof: ${social_proof}
    Line 4: CTA with URL: ${cta_goal} ${url}

    Guidelines:
    - Use MAXIMUM 3 emojis from these (if provided): ${preferred_emojis || "🚀,⭐,✨,💫,💪"}
    - Make each line impactful and clear
    - Focus on benefits and results
    - Language: ${language}
    - IMPORTANT: Return the bio with actual line breaks using \n between lines.
    - Each line must be complete and meaningful on its own.
    - STRICTLY ensure total character count is under 150 including line breaks.`

    // Initialize OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) throw new Error('OPENAI_API_KEY is not set')

    const configuration = new Configuration({ apiKey: openAIKey })
    const openai = new OpenAIApi(configuration)

    console.log('Sending request to OpenAI...')
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    })

    const bio = completion.data.choices[0]?.message?.content?.trim()
    if (!bio) throw new Error('No bio was generated')

    // Verify character count
    if (bio.length > 150) {
      console.error(`Generated bio exceeds 150 characters: ${bio.length} chars`)
      throw new Error('Generated bio exceeds 150 characters')
    }

    console.log('Successfully generated bio:', bio)
    console.log('Character count:', bio.length)

    return new Response(JSON.stringify({ bio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating bio:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})