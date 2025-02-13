
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

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('phase_based_analyses')
      .select('id')
      .eq('lead_id', leadId)
      .eq('phase_id', phaseId)
      .single();

    if (existingAnalysis) {
      return new Response(
        JSON.stringify({ error: 'Analysis for this phase already exists' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get business context from settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

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

    // Get phase information
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

    // Prepare social media insights
    const instagramData = lead.apify_instagram_data || {};
    const socialMediaPosts = lead.social_media_posts || [];
    const linkedinPosts = lead.linkedin_posts || [];

    // Create enhanced business context
    const businessContext = {
      companyName: settings?.company_name || '',
      productsServices: settings?.products_services || '',
      targetAudience: settings?.target_audience || '',
      usp: settings?.usp || '',
      businessDescription: settings?.business_description || ''
    };

    let systemPrompt = `Du bist ein hochspezialisierter Business Development Assistent für ${businessContext.companyName}. 
Deine Aufgabe ist es, Social Media Profile zu analysieren und konkrete Handlungsempfehlungen zu geben.

Nutze diese Informationen über uns:
🏢 Unternehmen: ${businessContext.businessDescription}
🎯 Zielgruppe: ${businessContext.targetAudience}
💫 USP: ${businessContext.usp}
🛍️ Produkte/Services: ${businessContext.productsServices}

Analysiere das Profil und erstelle einen strukturierten Bericht, der uns hilft, diesen Kontakt optimal anzusprechen.
Formatiere die Ausgabe mit Markdown und passenden Emojis.

Strukturiere die Analyse in:
1. 👤 Profil & Reichweite
2. 📊 Engagement & Aktivität
3. 🎯 Relevanz für uns
4. 💡 Ansprache-Strategie
5. ⚡️ Quick-Wins & nächste Schritte`;

    let userPrompt = `Analysiere dieses Profil für die Phase "${phaseData.pipeline_phases.name}":
      
Profil Basics:
- Name: ${lead.name}
- Bio: ${lead.social_media_bio || 'Nicht angegeben'}
- Followers: ${lead.social_media_followers || instagramData.followersCount || 'Unbekannt'}
- Following: ${lead.social_media_following || instagramData.followsCount || 'Unbekannt'}
- Engagement Rate: ${lead.social_media_engagement_rate || 'Unbekannt'}
- Interessen: ${lead.social_media_interests?.join(', ') || 'Keine angegeben'}
- Branche: ${lead.industry || 'Nicht angegeben'}
- Position: ${lead.position || 'Nicht angegeben'}
- Unternehmen: ${lead.company_name || 'Nicht angegeben'}

Instagram Posts (${socialMediaPosts.length}):
${socialMediaPosts.slice(0, 5).map((post: any) => `- ${post.content || 'Visueller Post'} (Likes: ${post.likes_count}, Kommentare: ${post.comments_count})`).join('\n')}

LinkedIn Posts (${linkedinPosts.length}):
${linkedinPosts.slice(0, 5).map((post: any) => `- ${post.content || 'LinkedIn Update'} (Reaktionen: ${post.reactions?.count || 0})`).join('\n')}

Letzte Aktivitäten:
${lead.notes?.map((note: any) => `- ${note.content}`).join('\n') || 'Keine Aktivitäten'}

Phasen-Kontext: ${phaseData.pipeline_phases.name}

Analysiere diese Informationen im Kontext unseres Geschäfts und gib konkrete, umsetzbare Empfehlungen.`;

    // Generate analysis using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-0125-preview',
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

    try {
      // Save analysis to database
      const { data: savedAnalysis, error: analysisError } = await supabase
        .from('phase_based_analyses')
        .insert({
          lead_id: leadId,
          phase_id: phaseId,
          analysis_type: phaseData.action_type,
          content: analysis,
          metadata: {
            context: {
              phase_name: phaseData.pipeline_phases.name,
              generated_at: new Date().toISOString(),
              user_id: userId,
              business_context: businessContext
            }
          },
          completed: true,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) {
        // If it's a unique constraint error, return a specific error message
        if (analysisError.code === '23505') {
          return new Response(
            JSON.stringify({ 
              error: "Eine Analyse für diese Phase existiert bereits",
              details: analysisError.message
            }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        throw analysisError;
      }

      return new Response(
        JSON.stringify({
          analysis: savedAnalysis,
          message: "Phasenanalyse erfolgreich erstellt"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (err) {
      // If it's a unique constraint error, handle it gracefully
      if (err.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: "Eine Analyse für diese Phase existiert bereits",
            details: err.message
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error('Error in phase analysis:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
