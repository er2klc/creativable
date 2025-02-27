
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

    console.log('🔍 Starte Phasenanalyse für:', { leadId, phaseId, userId });

    // Prüfe, ob bereits eine Analyse existiert
    const { data: existingAnalysis, error: existingError } = await supabase
      .from('phase_based_analyses')
      .select('*')
      .eq('lead_id', leadId)
      .eq('phase_id', phaseId)
      .single();

    if (existingAnalysis) {
      return new Response(JSON.stringify({ analysis: existingAnalysis, message: "Existierende Analyse geladen" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Benutzer Einstellungen abrufen
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Lead-Daten abrufen
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
        )
      `)
      .eq('id', leadId)
      .single();

    if (leadError || !lead) throw new Error('Lead nicht gefunden');

    // Phaseninformationen abrufen
    const { data: phaseData, error: phaseError } = await supabase
      .from('pipeline_phases')
      .select('*')
      .eq('id', phaseId)
      .single();

    if (phaseError || !phaseData) throw new Error('Phase nicht gefunden');

    // Geschäftsinfos aus den Settings abrufen
    const industry = settings?.industry?.toLowerCase() || "allgemein";
    const businessTypes = {
      "handwerk": "🔨 Persönliche & lokale Kundengewinnung. Empfehlungen & direkte Kontakte nutzen.",
      "network marketing": "📈 Fokus auf Beziehungsaufbau. Authentisches Storytelling & Social Proof einsetzen.",
      "coach": "🎓 Wertvolle Inhalte & Expertenstatus zeigen. Kundenbindung durch Mehrwert schaffen.",
      "influencer": "📢 Sichtbarkeit & Community-Aufbau priorisieren. Kooperationen & Content-Marketing nutzen.",
      "ernährungsberater": "🥗 Individuelle Beratung & Vertrauen aufbauen. Referenzen & Fallstudien nutzen.",
      "fitnesstrainer": "🏋️‍♂️ Demonstration von Expertise. Challenges & Gruppenmotivation als Strategie."
    };

    const businessStrategy = businessTypes[industry] || "📌 Allgemeine Strategie zur Geschäftsentwicklung.";

    // Dynamischer Prompt basierend auf Phase & Branche
    const phaseGuidance = {
      "Analyse": `🔍 Identifiziere das Potenzial dieses Kontakts für dein Geschäft. Berücksichtige folgende Faktoren: ${businessStrategy}`,
      "Kontaktaufnahme": `✉️ Entwickle eine **individuelle Ansprache**, die ${businessStrategy} unterstützt.`,
      "Bedarfsanalyse": `💬 Erfrage gezielt, welche Herausforderungen der Kontakt hat und **passe dein Angebot darauf an**.`,
      "Vertrauensaufbau": `🛠️ Zeige deine Expertise durch **hochwertige Inhalte** & **interaktive Gespräche**.`,
      "Abschluss": `🎯 Erstelle ein **maßgeschneidertes Angebot** und nutze psychologische Verkaufsstrategien.`
    };

    const systemPrompt = `Du bist ein hochspezialisierter Business Development Assistent für ${settings?.company_name || 'ein Unternehmen'}.
Deine Aufgabe ist es, für die Phase **${phaseData.name}** eine **präzise Strategie** zu entwickeln.

🏢 **Unternehmensinfos:**
- **Zielgruppe:** ${settings?.target_audience || 'Allgemein'}
- **USP:** ${settings?.usp || 'Nicht definiert'}
- **Branche:** ${industry.toUpperCase()}

📌 **Branchenspezifische Strategie:**
${businessStrategy}

📌 **Phase: ${phaseData.name}**
${phaseGuidance[phaseData.name] || "Erstelle eine individuelle Analyse."}`;

    // Sammle Notizen und Social Media Posts für Kontext
    const notes = lead.notes || [];
    const socialMediaPosts = lead.social_media_posts || [];
    const linkedinPosts = lead.linkedin_posts || [];

    const userPrompt = `
**📊 Lead-Analyse: [${lead.name}]**
- **Branche:** ${lead.industry || 'Nicht angegeben'}
- **Position:** ${lead.position || 'Nicht angegeben'}
- **Unternehmen:** ${lead.company_name || 'Nicht angegeben'}
- **Followers:** ${lead.social_media_followers || 'Unbekannt'}
- **Interessen:** ${lead.social_media_interests?.join(', ') || 'Keine angegeben'}

📌 **Letzte Aktivitäten:**
${notes.slice(0, 3).map((note: any) => `- ${note.content}`).join('\n') || 'Keine Aktivitäten'}

📌 **Social Media Aktivität:**
${socialMediaPosts.slice(0, 3).map((post: any) => `- ${post.content || '[Bild/Video Post]'}`).join('\n')}
${linkedinPosts.slice(0, 3).map((post: any) => `- ${post.content || '[LinkedIn Post]'}`).join('\n')}

🚀 **Deine Aufgabe:**  
Analysiere dieses Profil und erstelle eine **klare, handlungsorientierte Strategie**, um diesen Kontakt in **einen Kunden oder Partner zu verwandeln**.
`;

    console.log('🧠 Generiere Analyse mit OpenAI...');

    let analysis;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      console.log('⚠️ Kein OpenAI API Key - Fallback Analyse.');
      analysis = `# 📊 Analyse für ${lead.name}

## 🔍 Profil-Check
- Branche: ${lead.industry || 'Unbekannt'}
- Position: ${lead.position || 'Unbekannt'}

## 📌 Stärken & Chancen
🏆 [Erkennbare Stärken des Leads]  
⚡ [Wie du ihn ansprechen kannst]  

## 💡 Nächste Schritte
1. **Kontakt aufnehmen**: [Persönlicher Einstieg]  
2. **Bedarf analysieren**: [Fragen, um Interesse zu wecken]  
3. **Wertvolle Infos senden**: [Erklärung, warum der Lead profitieren könnte]`;
    } else {
      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${openaiApiKey}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            model: 'gpt-4o-mini', 
            messages: [
              { role: 'system', content: systemPrompt }, 
              { role: 'user', content: userPrompt }
            ], 
            temperature: 0.7 
          }),
        });

        const openAIData = await openAIResponse.json();
        
        if (openAIData.error) {
          console.error('OpenAI API Fehler:', openAIData.error);
          throw new Error(`OpenAI API Fehler: ${openAIData.error.message}`);
        }
        
        analysis = openAIData.choices[0].message.content;
      } catch (err) {
        console.error('❌ OpenAI Fehler:', err);
        throw err;
      }
    }

    console.log('✅ Analyse generiert, speichere in Datenbank...');

    // Speichere die Analyse in der Datenbank
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('phase_based_analyses')
      .insert({
        lead_id: leadId,
        phase_id: phaseId,
        created_by: userId,
        analysis_type: 'ai_analysis',
        content: analysis,
        metadata: {
          phase_name: phaseData.name,
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Fehler beim Speichern der Analyse:', saveError);
      throw saveError;
    }

    // Erstelle auch eine Notiz mit der Analyse
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
    console.error('❌ Fehler in der Phasenanalyse:', err);
    return new Response(
      JSON.stringify({ 
        error: err.message || 'Ein unerwarteter Fehler ist aufgetreten',
        details: err
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
