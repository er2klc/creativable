
import { serve } from 'https://deno.fresh.run/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  leadId: string
  phaseId: string
  userId: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    if (!req.body) {
      throw new Error('Request body is required')
    }

    const { leadId, phaseId, userId } = await req.json() as RequestBody
    
    if (!leadId || !phaseId || !userId) {
      throw new Error('Missing required fields: leadId, phaseId, or userId')
    }

    console.log('Starting analysis generation for:', { leadId, phaseId, userId })

    // Get user's OpenAI API key from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('openai_api_key')
      .eq('user_id', userId)
      .single()

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      throw new Error('Could not fetch user settings')
    }

    if (!settings?.openai_api_key) {
      throw new Error('OpenAI API key not found in user settings')
    }

    // Initialize OpenAI with user's API key
    const configuration = new Configuration({
      apiKey: settings.openai_api_key,
    })
    const openai = new OpenAIApi(configuration)

    // Fetch lead data
    const { data: lead, error: leadError } = await supabaseClient
      .from('leads')
      .select(`
        *,
        notes (*),
        messages (*),
        tasks (*),
        phase:pipeline_phases!inner (
          id,
          name,
          pipeline:pipelines!inner (
            id,
            name
          )
        )
      `)
      .eq('id', leadId)
      .single()

    if (leadError) {
      console.error('Error fetching lead:', leadError)
      throw new Error(`Error fetching lead data: ${leadError.message}`)
    }

    if (!lead) {
      throw new Error(`No lead found with ID ${leadId}`)
    }

    // Generate analysis prompt
    const prompt = `Analyze this contact based on the following information:
Name: ${lead.name}
Current Phase: ${lead?.phase?.name || 'Unknown'}
Platform: ${lead.platform || 'Unknown'}
Bio: ${lead.social_media_bio || 'No bio available'}

Recent Activities:
${lead.notes?.map(n => `- Note: ${n.content}`).join('\n') || 'No notes'}
${lead.messages?.map(m => `- Message: ${m.content}`).join('\n') || 'No messages'}
${lead.tasks?.map(t => `- Task: ${t.title}`).join('\n') || 'No tasks'}

Please provide:
1. A brief summary
2. Key points about this contact
3. Recommendations for next steps

Format the response in JSON with these fields: summary, key_points (array), recommendations (array)`

    // Generate analysis with OpenAI
    let completion
    try {
      completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant analyzing contact information. Provide concise, actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    } catch (openAiError: any) {
      console.error('OpenAI API error:', openAiError)
      // Check for specific OpenAI error types
      if (openAiError.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key in settings.')
      }
      throw new Error(`OpenAI API error: ${openAiError.message}`)
    }

    if (!completion?.data?.choices?.[0]?.message?.content) {
      throw new Error('No response received from OpenAI')
    }

    // Parse OpenAI response
    let analysis
    try {
      analysis = JSON.parse(completion.data.choices[0].message.content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      throw new Error('Invalid response format from OpenAI')
    }

    // Store analysis in database
    const { data: savedAnalysis, error: analysisError } = await supabaseClient
      .from('phase_based_analyses')
      .upsert({
        lead_id: leadId,
        phase_id: phaseId,
        created_by: userId,
        content: `Analysis for contact ${lead.name} in phase ${lead.phase?.name || 'Unknown'}`,
        metadata: {
          type: 'phase_analysis',
          analysis: analysis,
          generated_at: new Date().toISOString(),
          summary: analysis.summary,
          key_points: analysis.key_points,
          recommendations: analysis.recommendations
        },
        completed: true,
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (analysisError) {
      console.error('Error saving analysis:', analysisError)
      throw new Error(`Error saving analysis: ${analysisError.message}`)
    }

    return new Response(
      JSON.stringify({ data: savedAnalysis, error: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in generate-phase-analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: error.message.includes('API key') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
