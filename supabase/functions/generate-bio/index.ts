import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    const prompt = `Generate a VERY CONCISE professional bio. 
    CRITICAL: The bio MUST be EXACTLY 150 characters or less, including all spaces and emojis.
    Format: Single line only, no line breaks.
    Style: Professional, impactful, and concise.

    Guidelines:
    1. Use maximum 2-3 emojis total
    2. Prioritize essential information only
    3. Be extremely concise
    4. Count EVERY character carefully

    Information to include (prioritize in this order):
    1. Role: ${role}
    2. Target: ${target_audience}
    3. Value: ${unique_strengths}
    4. Proof: ${social_proof}
    5. CTA: ${cta_goal}
    6. URL: ${url}
    ${preferred_emojis ? `Preferred emojis (use sparingly): ${preferred_emojis}` : ''}

    Language: ${language}
    
    IMPORTANT: The final bio MUST be under 150 characters. This is a strict requirement.
    Return ONLY the bio text, no explanations or additional content.`

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
            content: 'You are a professional bio writer who specializes in creating concise, impactful bios that are exactly 150 characters or less.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    })

    const data = await response.json()
    const generatedBio = data.choices[0].message.content.trim()

    // Verify the length is 150 or less
    if (generatedBio.length > 150) {
      console.error(`Generated bio exceeds 150 characters: ${generatedBio.length} chars: "${generatedBio}"`)
      throw new Error(`Generated bio length (${generatedBio.length}) exceeds 150 characters`)
    }

    console.log(`Successfully generated bio with ${generatedBio.length} characters: "${generatedBio}"`)

    return new Response(
      JSON.stringify({ bio: generatedBio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})