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

    const prompt = `Generate a PROFESSIONAL and IMPACTFUL Instagram bio.
    CRITICAL: The bio MUST be EXACTLY 150 characters or less, including all spaces and emojis.
    Format: Single line only, no line breaks.

    Follow this structure STRICTLY but combine into ONE LINE:
    1. What you do (Role): ${role}
    2. Target audience: ${target_audience}
    3. Value/Uniqueness: ${unique_strengths}
    4. Social proof: ${social_proof}
    5. CTA with URL: ${cta_goal} ${url}

    Guidelines:
    - Use MAXIMUM 3 emojis from these (if provided): ${preferred_emojis || "🚀,⭐,✨,💫,💪"}
    - Make it punchy and memorable
    - Focus on benefits and results
    - Be extremely concise
    - Language: ${language}
    
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