
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
        linkedin_posts (
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

    // Prepare social media data
    const instagramData = lead.apify_instagram_data || {};
    const socialMediaPosts = lead.social_media_posts || [];
    const linkedinPosts = lead.linkedin_posts || [];

    // Generate phase-specific prompt
    let systemPrompt = `Du bist ein KI-Assistent, der auf die Analyse von Social Media Profilen und Geschäftsmöglichkeiten spezialisiert ist. 
Formatiere deine Antwort mit Markdown und nutze passende Emojis.

Strukturiere die Analyse in folgende Abschnitte:
1. Profil Übersicht 📊
2. Engagement Analyse 📈
3. Geschäftspotential 💼
4. Empfohlene Vorgehensweise 🎯
5. Wichtige Themen 💡

Halte die Analyse prägnant aber informativ. Verwende AUSSCHLIESSLICH Deutsch.`;

    let userPrompt = `Analysiere dieses Profil für die Phase "${phaseData.pipeline_phases.name}":
      
Social Media Profil:
- Bio: ${lead.social_media_bio || 'Nicht angegeben'}
- Followers: ${lead.social_media_followers || instagramData.followersCount || 'Unbekannt'}
- Following: ${lead.social_media_following || instagramData.followsCount || 'Unbekannt'}
- Engagement Rate: ${lead.social_media_engagement_rate || 'Unbekannt'}
- Interessen: ${lead.social_media_interests?.join(', ') || 'Keine angegeben'}
- Branche: ${lead.industry || 'Nicht angegeben'}
- Plattform: ${lead.platform || 'Nicht angegeben'}

Instagram Posts (${socialMediaPosts.length}):
${socialMediaPosts.slice(0, 5).map((post: any) => `- ${post.content || 'Visueller Post'} (Likes: ${post.likes_count}, Kommentare: ${post.comments_count})`).join('\n')}

LinkedIn Posts (${linkedinPosts.length}):
${linkedinPosts.slice(0, 5).map((post: any) => `- ${post.content || 'LinkedIn Update'} (Reaktionen: ${post.reactions?.count || 0})`).join('\n')}

Letzte Aktivitäten:
${lead.notes?.map((note: any) => `- ${note.content}`).join('\n') || 'Keine Aktivitäten'}

Phasen-Kontext: ${phaseData.pipeline_phases.name}

Erstelle eine detaillierte Analyse mit umsetzbaren Erkenntnissen und klaren Empfehlungen.`;

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

    // Create a note for the timeline
    const { data: timelineNote, error: noteError } = await supabase
      .from('notes')
      .insert({
        lead_id: leadId,
        user_id: userId,
        content: analysis,
        metadata: {
          type: 'phase_analysis',
          phase: phaseData.pipeline_phases.name,
          timestamp: new Date().toISOString(),
          analysis_type: phaseData.action_type
        }
      })
      .select()
      .single();

    if (noteError) throw noteError;

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
        timelineNote,
        message: "Phasenanalyse erfolgreich erstellt"
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
