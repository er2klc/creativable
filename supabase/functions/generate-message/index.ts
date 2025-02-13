
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
  phaseName?: string;
  phaseId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { leadName, leadPlatform, leadIndustry, companyName, usp, phaseName, phaseId } = await req.json() as MessageGenerationRequest

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get latest lead data including social media info
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('name', leadName)
      .single()

    // Get existing messages to check interaction history
    const { data: existingMessages } = await supabase
      .from('notes')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('metadata->>type', 'nexus_ai_message')
      .order('created_at', { ascending: false })

    // Analyze social media data
    const socialAnalysis = {
      platform: leadPlatform,
      followers: lead?.social_media_followers,
      engagement_rate: lead?.social_media_engagement_rate,
      bio: lead?.social_media_bio,
      hashtags: lead?.social_media_interests,
      industry: leadIndustry
    }

    // Determine message type based on phase and history
    const isFirstContact = !existingMessages || existingMessages.length === 0
    const templateType = isFirstContact ? 'first_contact' : 'follow_up'
    
    // Phase-specific message guidelines
    let phaseGuidelines = ""
    if (phaseName) {
      const normalizedPhaseName = phaseName.toLowerCase()
      if (normalizedPhaseName.includes('neu') || normalizedPhaseName.includes('kontakt') || normalizedPhaseName.includes('phase 1')) {
        phaseGuidelines = `
- Focus on establishing initial connection
- Show genuine interest in their work
- Keep it light and engaging
- Mention something specific from their profile`
      } else if (normalizedPhaseName.includes('follow') || normalizedPhaseName.includes('phase 2')) {
        phaseGuidelines = `
- Reference previous interaction if any
- Go deeper into their interests/work
- Share relevant value proposition
- Suggest specific next steps`
      } else if (normalizedPhaseName.includes('präsentation') || normalizedPhaseName.includes('abschluss')) {
        phaseGuidelines = `
- Be more direct about collaboration
- Reference specific opportunities
- Include clear call-to-action
- Suggest concrete meeting time/format`
      }
    }

    // Generate prompt based on analysis
    const prompt = `Generate a personalized ${templateType === 'first_contact' ? 'first contact' : 'follow-up'} message for ${leadName} with the following context:

Platform: ${socialAnalysis.platform}
Industry: ${socialAnalysis.industry}
${socialAnalysis.bio ? `Bio: ${socialAnalysis.bio}` : ''}
${socialAnalysis.hashtags?.length ? `Interests: ${socialAnalysis.hashtags.join(', ')}` : ''}
${socialAnalysis.followers ? `Followers: ${socialAnalysis.followers}` : ''}
${socialAnalysis.engagement_rate ? `Engagement Rate: ${(socialAnalysis.engagement_rate * 100).toFixed(1)}%` : ''}

Company Info:
${companyName ? `Company: ${companyName}` : ''}
${usp ? `USP: ${usp}` : ''}

Current Phase: ${phaseName || 'Unknown'}

Guidelines:
- Keep it concise (2-3 sentences)
- Be personal and authentic
- Reference their work or interests
- Include a clear call-to-action
- Follow ${socialAnalysis.platform} best practices
- Don't be too sales-focused
${phaseGuidelines}`

    console.log("Generating message with prompt:", prompt)

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
          template_type: templateType,
          phase: {
            id: phaseId,
            name: phaseName
          },
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (noteError) throw noteError

    console.log("Generated message saved:", note)

    return new Response(
      JSON.stringify({
        message: generatedMessage,
        note_id: note.id,
        template_type: templateType
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
