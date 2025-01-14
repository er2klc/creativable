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

    const prompt = `Create a professional bio based on the following information.
    The bio MUST be EXACTLY 150 characters or less - this is a strict requirement.
    The bio must be in a single line, no line breaks.
    Count each character (including spaces and emojis) carefully to ensure it's 150 or less.
    Make it concise but impactful.

    - Role/Profession: ${role}
    - Target Audience: ${target_audience}
    - Unique Strengths/Services: ${unique_strengths}
    - Mission/Goal: ${mission}
    - Social Proof/Achievements: ${social_proof}
    - Call-to-Action (CTA): ${cta_goal}
    - Link: ${url}
    ${preferred_emojis ? `- Preferred Emojis: ${preferred_emojis}` : ''}

    Write the bio in ${language}. Use appropriate emojis, but not too many.
    IMPORTANT: Count the characters and ensure the final bio is 150 characters or less.
    If needed, prioritize the most important information to stay within the character limit.
    Return ONLY the bio text, nothing else.`

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
    const generatedBio = data.choices[0].message.content

    // Verify the length is 150 or less
    if (generatedBio.length > 150) {
      console.error('Generated bio exceeds 150 characters:', generatedBio.length)
      throw new Error('Generated bio exceeds 150 characters')
    }

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