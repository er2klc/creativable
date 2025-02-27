
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
        notes (*),
        social_media_posts (*)
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
      "Kontakt erstellt": `🔍 Identifiziere das Potenzial dieses Kontakts für dein Geschäft. Berücksichtige folgende Faktoren: ${businessStrategy}`,
      "Kontaktaufnahme": `✉️ Entwickle eine **individuelle Ansprache**, die ${businessStrategy} unterstützt.`,
      "Kennenlernen": `💬 Erfrage gezielt, welche Herausforderungen der Kontakt hat und **passe dein Angebot darauf an**.`,
      "Präsentation": `🛠️ Zeige deine Expertise durch **hochwertige Inhalte** & **interaktive Gespräche**.`,
      "Follow-Up": `🎯 Erstelle ein **maßgeschneidertes Angebot** und nutze psychologische Verkaufsstrategien.`
    };

    // Sammle alle verfügbaren Notizen
    const notes = lead.notes || [];
    const noteContents = notes.slice(0, 5).map((note: any) => note.content).join('\n');

    // Sammle Social Media Posts
    const socialPosts = lead.social_media_posts || [];
    const socialContents = socialPosts.slice(0, 3).map((post: any) => post.content || '[Bild/Video Post]').join('\n');

    const systemPrompt = `Du bist ein hochspezialisierter Business Development Assistent für ${settings?.company_name || 'ein Unternehmen'}.
Deine Aufgabe ist es, für die Phase **${phaseData.name}** eine **präzise Strategie** zu entwickeln.

🏢 **Unternehmensinfos:**
- **Zielgruppe:** ${settings?.target_audience || 'Allgemein'}
- **USP:** ${settings?.usp || 'Nicht definiert'}
- **Branche:** ${industry.toUpperCase()}

📌 **Branchenspezifische Strategie:**
${businessStrategy}

📌 **Phase: ${phaseData.name}**
${phaseGuidance[phaseData.name] || "Erstelle eine individuelle Analyse."}

Ich brauche von dir eine ausführliche Analyse im Markdown-Format mit den folgenden Abschnitten:
- "# 📊 Analyse für [Name]" (Überschrift)
- "## 🔍 Profil-Check" (Zusammenfassung der Lead-Informationen)
- "## 📌 Stärken & Chancen" (Potenziale und Anknüpfungspunkte)
- "## 💡 Nächste Schritte" (Konkrete Handlungsempfehlungen)

Der Abschnitt "## 💡 Nächste Schritte" MUSS genau 3 nummerierte, konkrete Aufgaben enthalten, die der Benutzer ausführen kann. 
Formuliere diese präzise, klar und handlungsorientiert mit einem erkennbaren Titel und einer kurzen Erklärung.`;

    const userPrompt = `
**📊 Lead-Analyse: [${lead.name}]**
- **Branche:** ${lead.industry || 'Nicht angegeben'}
- **Position:** ${lead.position || 'Nicht angegeben'}
- **Unternehmen:** ${lead.company_name || 'Nicht angegeben'}
- **Followers:** ${lead.social_media_followers || 'Unbekannt'}
- **Interessen:** ${lead.social_media_interests?.join(', ') || 'Keine angegeben'}

📌 **Letzte Aktivitäten:**
${noteContents || 'Keine Aktivitäten'}

📌 **Social Media Aktivität:**
${socialContents || 'Keine Social Media Aktivitäten'}

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
          headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
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

    // Extrahiere die "Nächsten Schritte" aus der Analyse und erstelle Tasks
    try {
      console.log('🔍 Extrahiere Tasks aus der Analyse...');
      
      // Suche nach "## 💡 Nächste Schritte" Abschnitt und extrahiere die nummerierten Punkte
      const nextStepsMatch = analysis.match(/## 💡 Nächste Schritte\s+([\s\S]*?)(?=##|$)/);
      
      if (nextStepsMatch && nextStepsMatch[1]) {
        const nextStepsText = nextStepsMatch[1].trim();
        
        // Suche nach nummerierten Punkten (1. **Titel**: Beschreibung)
        const taskRegex = /(\d+)\.\s+\*\*([^*]+)\*\*:\s+([^\n]+)/g;
        const tasks = [];
        let match;
        
        while ((match = taskRegex.exec(nextStepsText)) !== null && tasks.length < 3) {
          const taskTitle = match[2].trim();
          const taskDescription = match[3].trim();
          
          tasks.push({
            title: `${taskTitle}: ${taskDescription}`,
            user_id: userId,
            lead_id: leadId,
            color: '#FFE2DD'
          });
        }
        
        // Fallback für den Fall, dass keine übereinstimmenden Tasks gefunden wurden
        if (tasks.length === 0) {
          // Alternative Regex für "1. **Titel** Beschreibung" Format
          const altTaskRegex = /(\d+)\.\s+\*\*([^*]+)\*\*\s+([^\n]+)/g;
          
          while ((match = altTaskRegex.exec(nextStepsText)) !== null && tasks.length < 3) {
            const taskTitle = match[2].trim();
            const taskDescription = match[3].trim();
            
            tasks.push({
              title: `${taskTitle}: ${taskDescription}`,
              user_id: userId,
              lead_id: leadId,
              color: '#FFE2DD'
            });
          }
        }
        
        // Wenn immer noch keine Tasks gefunden wurden, versuche es mit einfacheren Regex
        if (tasks.length === 0) {
          const simpleTaskRegex = /(\d+)\.\s+\*\*([^*\n]+)[:\*]*\s*([^\n]+)/g;
          
          while ((match = simpleTaskRegex.exec(nextStepsText)) !== null && tasks.length < 3) {
            tasks.push({
              title: `${match[2].trim()}: ${match[3].trim()}`,
              user_id: userId,
              lead_id: leadId,
              color: '#FFE2DD'
            });
          }
        }
        
        // Wenn Tasks gefunden wurden, speichere sie in der Datenbank
        if (tasks.length > 0) {
          console.log(`✅ ${tasks.length} Tasks aus der Analyse erstellt`);
          const { data: createdTasks, error: taskError } = await supabase
            .from('tasks')
            .insert(tasks)
            .select();
          
          if (taskError) {
            console.error('❌ Fehler beim Erstellen der Tasks:', taskError);
          } else {
            console.log('✅ Tasks erfolgreich erstellt:', createdTasks);
          }
        } else {
          console.log('⚠️ Keine Tasks in der Analyse gefunden');
        }
      } else {
        console.log('⚠️ Kein "Nächste Schritte" Abschnitt in der Analyse gefunden');
      }
    } catch (err) {
      console.error('❌ Fehler beim Extrahieren der Tasks:', err);
      // Ignoriere Fehler bei der Task-Erstellung, damit die Analyse trotzdem zurückgegeben wird
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
