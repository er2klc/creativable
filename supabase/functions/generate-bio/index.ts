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

    const prompt = `Erstelle eine Instagram-Bio basierend auf den folgenden Informationen. 
    Nutze kreative und relevante Emojis, um die Bio visuell ansprechend zu gestalten. 
    Halte die Bio klar, prägnant und maximal 150 Zeichen lang. 
    Die Bio sollte professionell wirken und zum Benutzer passen.

    - Beruf/Rolle: ${role}
    - Zielgruppe: ${target_audience}
    - Einzigartige Stärken/Dienstleistungen: ${unique_strengths}
    - Mission/Ziel: ${mission}
    - Soziale Beweise/Erfolge: ${social_proof}
    - Call-to-Action (CTA): ${cta_goal}
    - Link: ${url}
    ${preferred_emojis ? `- Bevorzugte Emojis: ${preferred_emojis}` : ''}

    Schreibe die Bio auf ${language}. Nutze passende Emojis, aber nicht übertrieben viele.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein erfahrener Social Media Manager, der sich auf das Erstellen professioneller Instagram-Bios spezialisiert hat.'
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