import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

serve(async (req) => {
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
    
    IMPORTANT: Return the bio with actual line breaks using \n between lines.
    Each line must be complete and meaningful on its own.`

    // Initialize OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) throw new Error('OPENAI_API_KEY is not set')

    const configuration = new Configuration({ apiKey: openAIKey })
    const openai = new OpenAIApi(configuration)

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    })

    const bio = completion.data.choices[0]?.message?.content?.trim()
    if (!bio) throw new Error('No bio was generated')

    // Verify character count
    if (bio.length > 150) {
      throw new Error('Generated bio exceeds 150 characters')
    }

    return new Response(JSON.stringify({ bio }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})