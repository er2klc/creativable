
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

    console.log('Starting analysis generation for:', { leadId, phaseId, userId });

    // Check if analysis already exists
    const { data: existingAnalysis, error: existingError } = await supabase
      .from('phase_based_analyses')
      .select('*')
      .eq('lead_id', leadId)
      .eq('phase_id', phaseId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing analysis:', existingError);
      throw existingError;
    }

    if (existingAnalysis) {
      console.log('Found existing analysis:', existingAnalysis.id);
      return new Response(
        JSON.stringify({
          analysis: existingAnalysis,
          message: "Existierende Analyse geladen"
        }),
        {
          status: 200,
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
    const { data: lead, error: leadError } = await supabase
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

    if (leadError) {
      console.error('Error fetching lead:', leadError);
      throw leadError;
    }
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Get phase information
    const { data: phaseData, error: phaseError } = await supabase
      .from('pipeline_phases')
      .select('*')
      .eq('id', phaseId)
      .single();

    if (phaseError) {
      console.error('Error fetching phase:', phaseError);
      throw phaseError;
    }

    if (!phaseData) {
      throw new Error('Phase not found');
    }

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

    const systemPrompt = `Du bist ein hochspezialisierter Business Development Assistent für ${businessContext.companyName}. 
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

    const userPrompt = `Analysiere dieses Profil für die Phase "${phaseData.name}":
      
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
${lead.notes?.slice(0, 5).map((note: any) => `- ${note.content}`).join('\n') || 'Keine Aktivitäten'}

Phasen-Kontext: ${phaseData.name}

Analysiere diese Informationen im Kontext unseres Geschäfts und gib konkrete, umsetzbare Empfehlungen.`;

    console.log('Generating analysis with OpenAI...');

    let analysis;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Use a simpler analysis if no OpenAI API key is available
    if (!openaiApiKey) {
      console.log('No OpenAI API key available, using default analysis');
      analysis = `# Analyse für ${lead.name}

## 👤 Profil & Reichweite
${lead.name} ist in der Branche ${lead.industry || 'Unbekannt'} tätig und hat eine Social Media Präsenz.

## 📊 Engagement & Aktivität 
Die Engagement-Rate liegt bei ${lead.social_media_engagement_rate || 'unbekannt'}.

## 🎯 Relevanz für uns
Basierend auf dem Profil könnte diese Person an unseren Produkten/Dienstleistungen interessiert sein.

## 💡 Ansprache-Strategie
Personalisierte Kontaktaufnahme empfohlen.

## ⚡️ Quick-Wins & nächste Schritte
1. Personalisierte Nachricht senden
2. Gemeinsame Interessen betonen
3. Vorschlag für ein unverbindliches Gespräch`;
    } else {
      // Generate analysis using OpenAI
      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-0125-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
          }),
        });

        const openAIData = await openAIResponse.json();
        
        if (openAIData.error) {
          console.error('OpenAI API error:', openAIData.error);
          throw new Error(`OpenAI API error: ${openAIData.error.message}`);
        }
        
        analysis = openAIData.choices[0].message.content;
      } catch (openaiError) {
        console.error('Error calling OpenAI:', openaiError);
        throw openaiError;
      }
    }

    console.log('Analysis generated, storing in database...');

    // Store the analysis in the database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('phase_based_analyses')
      .insert({
        lead_id: leadId,
        phase_id: phaseId,
        user_id: userId,
        analysis_type: 'ai_analysis',
        content: analysis,
        metadata: {
          context: {
            phase_name: phaseData.name,
            generated_at: new Date().toISOString(),
            user_id: userId,
            business_context: businessContext
          }
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      throw saveError;
    }

    console.log('Analysis saved successfully:', savedAnalysis?.id);

    // Also create a note with the analysis
    await supabase
      .from('notes')
      .insert({
        user_id: userId,
        lead_id: leadId,
        content: analysis,
        metadata: {
          type: 'phase_analysis',
          phase: {
            id: phaseId,
            name: phaseData.name
          },
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        analysis: savedAnalysis,
        message: "Phasenanalyse erfolgreich erstellt"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    console.error('Error in phase analysis:', err);
    return new Response(
      JSON.stringify({ 
        error: err.message || 'An unexpected error occurred',
        details: err
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
