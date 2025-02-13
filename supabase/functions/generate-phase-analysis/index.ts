
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhaseAnalysisRequest {
  leadId: string;
  phaseId: string;
  previousPhaseId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, phaseId, previousPhaseId } = await req.json() as PhaseAnalysisRequest;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lead data with all necessary information
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        social_media_posts (
          *
        ),
        notes (
          *
        ),
        messages (
          *
        )
      `)
      .eq('id', leadId)
      .single();

    if (!lead) throw new Error('Lead not found');

    // Get phase information and rules
    const { data: phaseData } = await supabase
      .from('phase_rules')
      .select(`
        *,
        pipeline_phases (
          name
        )
      `)
      .eq('phase_id', phaseId)
      .single();

    if (!phaseData) throw new Error('Phase rules not found');

    // Prepare analysis context based on phase type
    const analysisContext = {
      lead: {
        name: lead.name,
        platform: lead.platform,
        industry: lead.industry,
        socialMedia: {
          bio: lead.social_media_bio,
          followers: lead.social_media_followers,
          following: lead.social_media_following,
          engagementRate: lead.social_media_engagement_rate,
          interests: lead.social_media_interests,
        },
      },
      currentPhase: phaseData.pipeline_phases.name,
      previousPhase: previousPhaseId,
      rules: phaseData.rules,
    };

    // Generate phase-specific prompt
    let systemPrompt = "You are an AI assistant specialized in analyzing social media profiles and business opportunities. ";
    let userPrompt = "";

    switch (phaseData.action_type) {
      case 'initial_analysis':
        systemPrompt += "Focus on identifying potential opportunities and engagement patterns.";
        userPrompt = `Analyze this social media profile for business potential:
          - Bio: ${lead.social_media_bio}
          - Followers: ${lead.social_media_followers}
          - Following: ${lead.social_media_following}
          - Engagement Rate: ${lead.social_media_engagement_rate}
          - Interests: ${lead.social_media_interests?.join(', ')}
          
          Provide a detailed analysis including:
          1. Profile Overview
          2. Engagement Quality
          3. Business Potential
          4. Recommended Approach
          5. Key Topics to Discuss`;
        break;

      case 'message_analysis':
        systemPrompt += "Focus on conversation analysis and meeting potential.";
        userPrompt = `Analyze the current interaction state:
          - Previous Messages: ${JSON.stringify(lead.messages)}
          - Current Phase: ${phaseData.pipeline_phases.name}
          
          Provide analysis of:
          1. Conversation Progress
          2. Interest Level
          3. Next Best Action
          4. Meeting Recommendation`;
        break;

      case 'meeting_analysis':
        systemPrompt += "Focus on meeting preparation and key talking points.";
        userPrompt = `Prepare meeting analysis based on:
          - Profile: ${lead.social_media_bio}
          - Industry: ${lead.industry}
          - Previous Interactions: ${JSON.stringify(lead.notes)}
          
          Create meeting preparation including:
          1. Key Discussion Points
          2. Potential Objections
          3. Success Indicators
          4. Follow-up Strategy`;
        break;

      case 'presentation_tracking':
        systemPrompt += "Focus on engagement and follow-up strategy.";
        userPrompt = `Analyze presentation phase:
          - Industry: ${lead.industry}
          - Previous Notes: ${JSON.stringify(lead.notes)}
          
          Provide strategy for:
          1. Engagement Tracking
          2. Follow-up Timing
          3. Success Metrics
          4. Conversion Approach`;
        break;
    }

    // Generate analysis using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
      }),
    });

    const openAIData = await openAIResponse.json();
    const analysis = openAIData.choices[0].message.content;

    // Save analysis to database
    const { data: savedAnalysis, error: analysisError } = await supabase
      .from('phase_based_analyses')
      .insert({
        lead_id: leadId,
        phase_id: phaseId,
        analysis_type: phaseData.action_type,
        content: analysis,
        metadata: {
          context: analysisContext,
          generated_at: new Date().toISOString(),
          phase_name: phaseData.pipeline_phases.name,
        }
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Create a note with the analysis
    const { error: noteError } = await supabase
      .from('notes')
      .insert({
        lead_id: leadId,
        content: analysis,
        phase_analysis_id: savedAnalysis.id,
        metadata: {
          type: 'phase_analysis',
          analysis_type: phaseData.action_type,
          phase: {
            id: phaseId,
            name: phaseData.pipeline_phases.name
          }
        }
      });

    if (noteError) throw noteError;

    return new Response(
      JSON.stringify({
        analysis: savedAnalysis,
        message: "Phase analysis completed successfully"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('Error in phase analysis:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
