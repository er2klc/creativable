
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageGenerationRequest {
  leadName: string;
  leadPlatform: string;
  leadIndustry: string;
  companyName?: string;
  usp?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { leadName, leadPlatform, leadIndustry, companyName, usp } = await req.json() as MessageGenerationRequest

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get latest lead data including social media info
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('name', leadName)
      .single()

    // Analyze social media data
    const socialAnalysis = {
      platform: leadPlatform,
      followers: lead?.social_media_followers,
      engagement_rate: lead?.social_media_engagement_rate,
      bio: lead?.social_media_bio,
      hashtags: lead?.social_media_interests,
      industry: leadIndustry
    }

    // Generate prompt based on analysis
    const prompt = `Generate a personalized first contact message for ${leadName} with the following context:

Platform: ${socialAnalysis.platform}
Industry: ${socialAnalysis.industry}
${socialAnalysis.bio ? `Bio: ${socialAnalysis.bio}` : ''}
${socialAnalysis.hashtags?.length ? `Interests: ${socialAnalysis.hashtags.join(', ')}` : ''}
${socialAnalysis.followers ? `Followers: ${socialAnalysis.followers}` : ''}
${socialAnalysis.engagement_rate ? `Engagement Rate: ${(socialAnalysis.engagement_rate * 100).toFixed(1)}%` : ''}

Company Info:
${companyName ? `Company: ${companyName}` : ''}
${usp ? `USP: ${usp}` : ''}

Guidelines:
- Keep it concise (2-3 sentences)
- Be personal and authentic
- Reference their work or interests
- Include a clear call-to-action
- Follow ${socialAnalysis.platform} best practices
- Don't be too sales-focused`

    // Generate message using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are an expert in professional social media communication. You craft personalized, authentic messages that resonate with the recipient's interests and background."
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    const openAIData = await openAIResponse.json()
    const generatedMessage = openAIData.choices[0].message.content

    // Save message to notes with analysis
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        lead_id: lead.id,
        content: generatedMessage,
        metadata: {
          type: 'nexus_ai_message',
          analysis: {
            social_media_bio: socialAnalysis.bio,
            hashtags: socialAnalysis.hashtags,
            engagement_metrics: {
              followers: socialAnalysis.followers,
              engagement_rate: socialAnalysis.engagement_rate
            }
          },
          template_type: 'first_contact',
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (noteError) throw noteError

    return new Response(
      JSON.stringify({
        message: generatedMessage,
        note_id: note.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
