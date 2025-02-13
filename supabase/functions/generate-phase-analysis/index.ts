
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
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, phaseId, userId } = await req.json() as PhaseAnalysisRequest;

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

    // Generate phase-specific prompt
    let systemPrompt = `You are an AI assistant specialized in analyzing social media profiles and business opportunities. Format your response using markdown with sections. Include emojis where appropriate.

Key sections to include:
1. Profile Overview 📊
2. Engagement Analysis 📈
3. Business Potential 💼
4. Recommended Approach 🎯
5. Key Topics 💡

Make it concise but informative.`;

    let userPrompt = `Analyze this profile for the ${phaseData.pipeline_phases.name} phase:
      
Social Media Profile:
- Bio: ${lead.social_media_bio || 'Not provided'}
- Followers: ${lead.social_media_followers || 'Unknown'}
- Following: ${lead.social_media_following || 'Unknown'}
- Engagement Rate: ${lead.social_media_engagement_rate || 'Unknown'}
- Interests: ${lead.social_media_interests?.join(', ') || 'None specified'}
- Industry: ${lead.industry || 'Not specified'}
- Platform: ${lead.platform || 'Not specified'}

Recent Activity:
${lead.notes?.map((note: any) => `- ${note.content}`).join('\n') || 'No recent activity'}

Phase Context: ${phaseData.pipeline_phases.name}

Provide a detailed analysis with actionable insights and clear recommendations.`;

    // Generate analysis using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        temperature: 0.7,
      }),
    });

    const openAIData = await openAIResponse.json();
    const analysis = openAIData.choices[0].message.content;

    // Save analysis to database
    const { data: savedAnalysis, error: analysisError } = await supabase
      .from('phase_based_analyses')
      .upsert({
        lead_id: leadId,
        phase_id: phaseId,
        analysis_type: phaseData.action_type,
        content: analysis,
        metadata: {
          context: {
            phase_name: phaseData.pipeline_phases.name,
            generated_at: new Date().toISOString(),
            user_id: userId
          }
        },
        completed: true,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

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
