import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeadSummaryRequest {
  leadId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request body
    const { leadId } = await req.json() as LeadSummaryRequest
    
    console.log('Generating summary for lead:', leadId)

    // Fetch lead data with all related information
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        messages (*),
        tasks (*),
        notes (*),
        social_media_posts (*),
        lead_files (*)
      `)
      .eq('id', leadId)
      .single()

    if (leadError) {
      console.error('Error fetching lead:', leadError)
      throw leadError
    }

    if (!lead) {
      throw new Error('Lead not found')
    }

    // Calculate engagement metrics
    const socialPosts = lead.social_media_posts || []
    const totalEngagement = socialPosts.reduce((sum, post) => {
      return sum + (post.likes_count || 0) + (post.comments_count || 0)
    }, 0)

    // Analyze current phase and status
    const currentPhase = lead.phase_id
    const { data: phaseData } = await supabase
      .from('pipeline_phases')
      .select('name')
      .eq('id', currentPhase)
      .single()

    const phaseName = phaseData?.name || 'Unbekannte Phase'
    
    // Generate personalized strategy
    let strategy = ''
    let nextSteps = ''

    if (phaseName.toLowerCase().includes('erstkontakt') || phaseName.toLowerCase().includes('neukontakt')) {
      strategy = `
Basierend auf der Analyse empfehle ich folgende Vorgehensweise:

1. Personalisierte Erstansprache:
   - Beziehe dich auf die Interessen: ${(lead.social_media_interests || []).join(', ')}
   - Nutze die Branchenexpertise: ${lead.industry || 'Noch nicht erfasst'}

2. Vorgeschlagene Nachricht:
   "Hallo ${lead.name},
   
   ich habe gesehen, dass Sie sich für ${(lead.social_media_interests || [''])[0]} interessieren. 
   Gerne würde ich Ihnen zeigen, wie wir in diesem Bereich bereits anderen erfolgreich helfen konnten.
   
   Hätten Sie Interesse an einem kurzen Austausch?"

3. Follow-up Strategie:
   - Nach 2-3 Tagen ohne Antwort: Sanfte Erinnerung mit Mehrwert
   - Social Media Engagement aufbauen durch Likes und relevante Kommentare`

    } else {
      const activities = [
        ...(lead.messages || []),
        ...(lead.tasks || []),
        ...(lead.notes || [])
      ].length

      strategy = `
Basierend auf ${activities} Interaktionen und der aktuellen Phase "${phaseName}", empfehle ich:

1. Nächste Schritte:
   - ${activities > 5 ? 'Vertiefendes Gespräch zur Zusammenarbeit anbieten' : 'Mehr über Bedürfnisse und Ziele herausfinden'}
   - Fokus auf ${lead.contact_type === 'partner' ? 'Partnerschaftsmöglichkeiten' : 'Kundenvorteile'} legen

2. Personalisierte Strategie:
   - Nutze die identifizierten Interessen: ${(lead.social_media_interests || []).join(', ')}
   - Engagement Level: ${totalEngagement > 100 ? 'Hoch' : totalEngagement > 50 ? 'Mittel' : 'Ausbaufähig'}

3. Konkrete Handlungsempfehlungen:
   - ${lead.social_media_bio ? 'Beziehe dich auf das Profil: ' + lead.social_media_bio : 'Erfahre mehr über den beruflichen Hintergrund'}
   - ${lead.industry ? `Zeige Branchenexpertise im Bereich ${lead.industry}` : 'Erkunde die spezifische Branchensituation'}`
    }

    const summary = {
      strategy,
      nextSteps,
      phaseName,
      totalEngagement,
      lastInteraction: lead.last_interaction_date
    }

    return new Response(
      JSON.stringify(summary),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('Error in generate-lead-summary:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})