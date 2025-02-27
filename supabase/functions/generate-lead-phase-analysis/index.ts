
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
      console.log('✅ Existierende Analyse gefunden:', existingAnalysis.id);
      return new Response(JSON.stringify({ analysis: existingAnalysis, message: "Existierende Analyse geladen" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Lead-Daten umfassend abrufen
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        notes (*, created_at, content, metadata),
        social_media_posts (*),
        tasks (*),
        messages (*)
      `)
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('❌ Lead nicht gefunden:', leadError);
      throw new Error('Lead nicht gefunden');
    }

    // Benutzer Einstellungen abrufen
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Phaseninformationen abrufen
    const { data: phaseData, error: phaseError } = await supabase
      .from('pipeline_phases')
      .select('*, pipeline:pipelines(name)')
      .eq('id', phaseId)
      .single();

    if (phaseError || !phaseData) {
      console.error('❌ Phase nicht gefunden:', phaseError);
      throw new Error('Phase nicht gefunden');
    }

    console.log('✅ Lead und Phase gefunden:', {
      leadName: lead.name,
      phaseName: phaseData.name,
      pipelineName: phaseData.pipeline?.name
    });

    // Sortiere und bereite die Lead-Daten auf
    const notes = Array.isArray(lead.notes) ? lead.notes.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 5) : [];

    const socialPosts = Array.isArray(lead.social_media_posts) ? 
      lead.social_media_posts.sort((a, b) => 
        new Date(b.posted_at || b.created_at).getTime() - new Date(a.posted_at || a.created_at).getTime()
      ).slice(0, 3) : [];

    const tasks = Array.isArray(lead.tasks) ? lead.tasks.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 5) : [];

    const messages = Array.isArray(lead.messages) ? lead.messages.sort((a, b) => 
      new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime()
    ).slice(0, 5) : [];

    const interests = Array.isArray(lead.social_media_interests) ? lead.social_media_interests : [];

    // Branchenspezifische Strategien
    const industry = (settings?.industry || "allgemein").toLowerCase();
    const businessTypes = {
      "handwerk": {
        strategy: "🔨 Persönliche & lokale Kundengewinnung. Referenzen und lokaler Bezug sind Key.",
        expertise: "Handwerks- und lokalen Dienstleistungsmarkt, persönliche Kundenbeziehungen und Empfehlungsmarketing",
        approach: "Vertrauen und persönliche Beziehungen als Grundlage für langfristige Zusammenarbeit"
      },
      "network marketing": {
        strategy: "📈 Beziehungsaufbau und Storytelling. Konzentriere dich auf Win-Win und gemeinsames Wachstum.",
        expertise: "Network Marketing, Teamaufbau, Empfehlungsmarketing und passives Einkommen",
        approach: "Persönliche Erfolgsgeschichten und authentische Beziehungen für nachhaltige Partnerschaften"
      },
      "coach": {
        strategy: "🎓 Expertise demonstrieren und Mehrwert bieten. Transformative Ergebnisse in den Fokus stellen.",
        expertise: "Coaching-Methodiken, Persönlichkeitsentwicklung und transformative Prozesse",
        approach: "Empathische Kommunikation und lösungsorientierte Fragen für tiefgreifende Gespräche"
      },
      "influencer": {
        strategy: "📢 Sichtbarkeit und Community-Aufbau. Kooperationen und Content-Marketing nutzen.",
        expertise: "Social Media Strategien, Content-Kreation und Reichweitenaufbau",
        approach: "Kreative Kooperationen und Win-Win-Situationen für maximale Reichweite"
      },
      "ernährungsberater": {
        strategy: "🥗 Individuelle Beratung und ganzheitlichen Ansatz betonen. Langfristige Erfolge zeigen.",
        expertise: "Ernährungskonzepte, gesundheitliche Transformation und nachhaltige Lebensstiländerungen",
        approach: "Einfühlsame Bedarfsanalyse und individualisierte Lösungen für optimale Ergebnisse"
      },
      "fitnesstrainer": {
        strategy: "🏋️‍♂️ Expertise zeigen und Community-Gefühl schaffen. Motivation als Schlüsselfaktor.",
        expertise: "Trainingsprogramme, Motivation und messbare Fitnessfortschritte",
        approach: "Begeisterungsfähigkeit und strukturierte Trainingskonzepte für nachhaltige Erfolge"
      }
    };

    const businessTypeInfo = businessTypes[industry] || {
      strategy: "📌 Allgemeine Strategie zur Geschäftsentwicklung.",
      expertise: "Business Development, Kundenakquise und Relationship Management",
      approach: "Wertorientierte Kommunikation und maßgeschneiderte Lösungen"
    };

    // Phasenspezifische Anleitungen
    const phaseGuides = {
      "Kontakt erstellt": {
        focus: "Analyse des Potenzials und Vorbereitung der perfekten Erstansprache",
        tasks: [
          "Perfekte Erstansprache formulieren",
          "Gemeinsame Touchpoints identifizieren",
          "Kontaktaufnahmestrategie festlegen"
        ],
        systemPrompt: `Du bist ein Elite-Experte für ${businessTypeInfo.expertise}. Deine Aufgabe ist die initiale Analyse eines neuen Kontakts.

Erstelle eine konkrete, handlungsorientierte Anleitung mit folgenden Abschnitten:
1. Analyse des Business-Potenzials dieses Kontakts
2. Perfekt formulierte Erstansprache-Nachricht (personalisiert, ansprechend, mit Call-to-Action)
3. Strategie für die Kontaktaufnahme (Timing, Plattform, Follow-up Plan)

Die Erstansprache MUSS vollständig ausformuliert sein und diese Elemente enthalten:
- Persönliche Anrede und Bezug zu spezifischen Details aus dem Profil
- Gemeinsame Interessen oder Verbindungen
- Klarer Mehrwert ohne aufdringlich zu wirken
- Call-to-Action, der leicht zu befolgen ist

Sei menschlich, authentisch und strategisch. Dein Ziel ist die Etablierung eines ersten Kontakts.`
      },
      "Kontaktaufnahme": {
        focus: "Gespräch initiieren und Interesse wecken",
        tasks: [
          "Personalisierte Nachricht senden",
          "Follow-up Strategie entwickeln",
          "Gesprächsthemen vorbereiten"
        ],
        systemPrompt: `Du bist ein Elite-Experte für ${businessTypeInfo.expertise}. Deine Aufgabe ist es, die Kontaktaufnahme zu optimieren.

Erstelle einen actionablen Plan mit folgenden Elementen:
1. Perfekt formulierte, personalisierte Nachricht (fix-fertig zum Senden, auf Plattform angepasst)
2. Follow-up Strategie falls keine Antwort (mit exakten Zeitpunkten und alternativen Formulierungen)
3. Gesprächsleitfaden für das erste Gespräch (Einstieg, Kernfragen, Erfolgsindikatoren)

Die Nachricht und der Gesprächsleitfaden MÜSSEN vollständig ausformuliert sein. Verwende psychologische Prinzipien wie:
- Soziale Validierung
- Reziprozität
- Knappheit/Exklusivität (wenn angemessen)
- Personalisierte Wertangebote

Sei menschlich, authentisch und strategisch. Dein Ziel ist die Initiierung eines echten Dialogs.`
      },
      "Kennenlernen": {
        focus: "Bedürfnisse verstehen und Vertrauen aufbauen",
        tasks: [
          "Gesprächsleitfaden erstellen",
          "Schmerzpunkte identifizieren",
          "Vertrauensaufbau planen"
        ],
        systemPrompt: `Du bist ein Elite-Experte für ${businessTypeInfo.expertise}. Deine Aufgabe ist die Optimierung des Kennenlerngesprächs.

Erstelle einen detaillierten Gesprächsplan mit:
1. Vollständig ausformuliertem Telefonscript (Einstieg, Hauptteil, Abschluss)
2. Präzisen Fragen zur Bedarfsanalyse (mit Begründung und Follow-ups)
3. Strategie zum Vertrauensaufbau und nächsten Schritten

Das Telefonscript MUSS umfassend sein und folgende Elemente enthalten:
- Persönlicher Einstieg mit Bezug zu bisherigen Interaktionen
- Offene und geschlossene Fragen in strategischer Reihenfolge
- Aktives Zuhören und Paraphrasieren
- Eleganter Übergang zum Wertangebot
- Klare nächste Schritte

Sei menschlich, empathisch und lösungsorientiert. Dein Ziel ist tiefes Verständnis und Vertrauen.`
      },
      "Präsentation": {
        focus: "Maßgeschneiderte Lösung präsentieren",
        tasks: [
          "Präsentationsstrategie entwickeln",
          "Einwandbehandlung vorbereiten",
          "Abschlussplan erstellen"
        ],
        systemPrompt: `Du bist ein Elite-Experte für ${businessTypeInfo.expertise}. Deine Aufgabe ist die Optimierung der Angebotspräsentation.

Erstelle eine Präsentationsstrategie mit:
1. Struktur der perfekten Präsentation (mit psychologischen Triggers)
2. Vollständige Einwandbehandlung (für die 3-5 häufigsten Einwände)
3. Abschlusstechnik mit konkreten Formulierungen

Die Präsentationsstrategie MUSS umfassen:
- Einstieg mit Recap der identifizierten Bedürfnisse
- Storytelling-Elemente für emotionale Verbindung
- Präzise Nutzenargumentation (nicht Features, sondern Benefits)
- Soziale Beweise und Erfolgsgeschichten
- Konkrete Formulierungen für den Abschluss

Sei überzeugend, wertorientiert und lösungsfokussiert. Dein Ziel ist die maßgeschneiderte Präsentation einer idealen Lösung.`
      },
      "Follow-Up": {
        focus: "Beziehung stärken und nächste Schritte definieren",
        tasks: [
          "Follow-Up Nachricht formulieren",
          "Langfristige Beziehungsstrategie",
          "Zusätzliche Wertangebote identifizieren"
        ],
        systemPrompt: `Du bist ein Elite-Experte für ${businessTypeInfo.expertise}. Deine Aufgabe ist die Optimierung des Follow-Up Prozesses.

Erstelle einen strategischen Follow-Up Plan mit:
1. Perfekt formulierte Follow-Up Nachricht (fix-fertig zum Senden)
2. Stufenweiser Plan für die langfristige Beziehungspflege
3. Cross-Selling und Empfehlungsstrategie mit konkreten Formulierungen

Die Follow-Up Nachricht MUSS enthalten:
- Bezug zum letzten Gespräch mit spezifischen Details
- Wiederholung des Mehrwerts und nächsten Schritten
- Zusätzliche wertvolle Information oder Ressource
- Zeitnaher, konkreter Call-to-Action

Sei wertschätzend, hilfreich und strategisch. Dein Ziel ist eine langfristige, profitable Beziehung aufzubauen.`
      }
    };

    // Default-Guide falls die Phase nicht direkt übereinstimmt
    const defaultGuide = {
      focus: "Beziehung entwickeln und nächste Phase vorbereiten",
      tasks: [
        "Situation analysieren",
        "Kommunikationsstrategie entwickeln",
        "Nächste Schritte definieren"
      ],
      systemPrompt: `Du bist ein Elite-Experte für ${businessTypeInfo.expertise}. Deine Aufgabe ist die strategische Beratung für die Phase "${phaseData.name}".

Erstelle einen konkreten Aktionsplan mit:
1. Analyse der aktuellen Situation und des Potenzials
2. Perfekt formulierte Kommunikation (fix-fertig zum Verwenden)
3. Strategie für die nächsten Schritte mit konkreten Handlungsanweisungen

Die Kommunikation MUSS vollständig ausformuliert sein und folgende Elemente enthalten:
- Personalisierung auf Basis der verfügbaren Informationen
- Klarer Wertbeitrag und Nutzenargumentation
- Konkreter Call-to-Action

Sei strategisch, menschlich und ergebnisorientiert. Dein Ziel ist die erfolgreiche Weiterentwicklung der Beziehung.`
    };

    // Wähle den richtigen Guide basierend auf dem Phasennamen
    let phaseGuide = defaultGuide;
    for (const [key, guide] of Object.entries(phaseGuides)) {
      if (phaseData.name.toLowerCase().includes(key.toLowerCase())) {
        phaseGuide = guide;
        break;
      }
    }

    console.log('✅ Phase-Guide ausgewählt:', { 
      phaseName: phaseData.name, 
      guideFocus: phaseGuide.focus 
    });

    // Formatiere Informationen für den Prompt
    const socialInfo = socialPosts.length > 0 
      ? socialPosts.map((post: any) => 
          `- ${post.posted_at ? new Date(post.posted_at).toLocaleDateString() : 'k.A.'}: ${post.content || '[Bild/Video Post]'} (${post.likes_count || 0} Likes, ${post.comments_count || 0} Kommentare)`
        ).join('\n')
      : 'Keine Social Media Aktivitäten gefunden';

    const interestsInfo = interests.length > 0 
      ? interests.join(', ') 
      : 'Keine spezifischen Interessen bekannt';

    const notesInfo = notes.length > 0 
      ? notes.map((note: any) => 
          `- ${new Date(note.created_at).toLocaleDateString()}: ${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}`
        ).join('\n')
      : 'Keine Notizen verfügbar';

    const messagesInfo = messages.length > 0 
      ? messages.map((msg: any) => 
          `- ${msg.sent_at ? new Date(msg.sent_at).toLocaleDateString() : 'k.A.'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
        ).join('\n')
      : 'Keine bisherige Kommunikation';
    
    // Erstelle den System-Prompt
    const systemPrompt = `${phaseGuide.systemPrompt}

WICHTIG: Erstelle eine Analyse im Markdown-Format mit diesen Abschnitten:
1. "# 📊 Strategie für ${lead.name} - Phase: ${phaseData.name}"
2. "## 🔍 Profil-Analyse" (Potenzial, Stärken, Möglichkeiten)
3. "## 💬 Perfekte Kommunikation" (Fix-fertige Nachricht/Script)
4. "## 🛠 Strategie & Umsetzung" (Konkrete Vorgehensweise)
5. "## 💡 Nächste Schritte" (3 konkrete, nummerierte Aufgaben)

Im Abschnitt "## 💡 Nächste Schritte" MUSST du genau 3 spezifische Aufgaben erstellen, die sofort umsetzbar sind.
Format MUSS sein: "1. **Aufgabentitel**: Detaillierte Beschreibung der Aufgabe"
Die Aufgaben müssen für den Benutzer wertvoll sein und konkrete Details enthalten.

Die "💬 Perfekte Kommunikation" MUSS fix-fertig formuliert sein - einsatzbereit für direkte Verwendung.

KRITISCH: Deine Analyse muss spezifisch für die Phase "${phaseData.name}" sein und ${businessTypeInfo.approach} fokussieren.`;

    // Erstelle den User-Prompt mit allen relevanten Informationen über den Lead
    const userPrompt = `
# Analyse für ${lead.name} - ${phaseData.name}

## Kontaktinformationen
- **Name:** ${lead.name}
- **Branche:** ${lead.industry || 'Nicht angegeben'}
- **Position:** ${lead.position || 'Nicht angegeben'}
- **Unternehmen:** ${lead.company_name || 'Nicht angegeben'}
- **E-Mail:** ${lead.email || 'Nicht verfügbar'}
- **Telefon:** ${lead.phone_number || 'Nicht verfügbar'}
- **Social Media:** ${lead.platform || 'Unbekannt'} (${lead.social_media_username || 'kein Benutzername'})
- **Follower:** ${lead.social_media_followers || 'Unbekannt'}
- **Interessen:** ${interestsInfo}

## Bisheriger Kontakt
${messagesInfo}

## Notizen
${notesInfo}

## Social Media Aktivität
${socialInfo}

## Mein Unternehmen
- **Name:** ${settings?.company_name || 'Nicht definiert'}
- **Branche:** ${industry.toUpperCase()}
- **Zielgruppe:** ${settings?.target_audience || 'Allgemein'}
- **USP:** ${settings?.usp || 'Nicht definiert'}

## Deine Aufgabe
Erstelle eine maßgeschneiderte Strategie für die Phase "${phaseData.name}".
Fokus: ${phaseGuide.focus}
Schlüsselaufgaben: ${phaseGuide.tasks.join(', ')}

WICHTIG: Ich benötige konkrete, sofort umsetzbare Maßnahmen, keine allgemeinen Ratschläge.
`;

    console.log('🧠 Starte OpenAI Anfrage...');

    // Generiere die Analyse
    let analysis;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      console.log('⚠️ Kein OpenAI API Key - Fallback Analyse wird verwendet');
      // Fallback für den Fall, dass kein API Key verfügbar ist
      analysis = `# 📊 Strategie für ${lead.name} - Phase: ${phaseData.name}

## 🔍 Profil-Analyse
- Branche: ${lead.industry || 'Nicht angegeben'}
- Position: ${lead.position || 'Nicht angegeben'}
- Potenzial: Basierend auf dem Profil besteht Potenzial für eine erfolgreiche Zusammenarbeit.

## 💬 Perfekte Kommunikation
"Hallo ${lead.name},

ich bin auf Ihr Profil aufmerksam geworden und sehe, dass Sie in der ${lead.industry || 'Branche'} tätig sind. Besonders interessant finde ich Ihre Erfahrung mit ${lead.position || 'Ihrer Position'}.

Ich arbeite mit Menschen wie Ihnen zusammen, um [konkrete Ergebnisse]. Hätten Sie Interesse an einem kurzen Gespräch, um Möglichkeiten einer Zusammenarbeit zu besprechen?

Freundliche Grüße"

## 🛠 Strategie & Umsetzung
1. Personalisierte Nachricht über die bevorzugte Plattform senden
2. Nach 3-4 Tagen ohne Antwort freundlich nachfassen
3. Bei positivem Feedback ein 15-20 minütiges Gespräch anbieten

## 💡 Nächste Schritte
1. **Personalisierte Nachricht senden**: Verwende die obige Vorlage und passe sie weiter an die spezifischen Interessen und Aktivitäten von ${lead.name} an.
2. **Gesprächsstrategie entwickeln**: Bereite 3-5 spezifische Fragen vor, um die Bedürfnisse und Herausforderungen von ${lead.name} besser zu verstehen.
3. **Wertangebot formulieren**: Basierend auf der Branche und Position, erstelle ein präzises Wertangebot, das die spezifischen Vorteile einer Zusammenarbeit hervorhebt.`;
    } else {
      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${openaiApiKey}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            model: 'gpt-4o-mini', // Verwende gpt-4o-mini für schnellere Antworten und gute Qualität
            messages: [
              { role: 'system', content: systemPrompt }, 
              { role: 'user', content: userPrompt }
            ], 
            temperature: 0.7 
          }),
        });

        const openAIData = await openAIResponse.json();
        
        if (openAIData.error) {
          console.error('❌ OpenAI API Fehler:', openAIData.error);
          throw new Error(`OpenAI API Fehler: ${openAIData.error.message}`);
        }
        
        analysis = openAIData.choices[0].message.content;
        console.log('✅ OpenAI Antwort erfolgreich erhalten');
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
          pipeline_name: phaseData.pipeline?.name,
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

    console.log('✅ Analyse und Notiz gespeichert, extrahiere jetzt Tasks...');

    // Extrahiere die "Nächsten Schritte" aus der Analyse und erstelle Tasks
    try {
      // Suche nach "## 💡 Nächste Schritte" Abschnitt und extrahiere die nummerierten Punkte
      const nextStepsMatch = analysis.match(/## 💡 Nächste Schritte\s+([\s\S]*?)(?=##|$)/);
      
      if (nextStepsMatch && nextStepsMatch[1]) {
        const nextStepsText = nextStepsMatch[1].trim();
        console.log('🔍 "Nächste Schritte" Abschnitt gefunden:', nextStepsText.substring(0, 100) + '...');
        
        // Suche nach nummerierten Punkten (1. **Titel**: Beschreibung)
        const taskRegex = /(\d+)\.\s+\*\*([^*:]+)(?:\*\*)?(?::)?\s+(.+?)(?=\d+\.\s+\*\*|$)/gs;
        const tasks = [];
        let match;
        let taskCount = 0;
        
        while ((match = taskRegex.exec(nextStepsText)) !== null && taskCount < 3) {
          taskCount++;
          const taskTitle = match[2].trim();
          const taskDescription = match[3].trim();
          
          tasks.push({
            title: `${taskTitle}: ${taskDescription}`,
            user_id: userId,
            lead_id: leadId,
            color: '#FFE2DD',
            priority: 'High',
            order_index: taskCount - 1,
            created_at: new Date().toISOString()
          });
        }
        
        // Fallback für den Fall, dass keine übereinstimmenden Tasks gefunden wurden
        if (tasks.length === 0) {
          console.log('⚠️ Kein Task-Match mit Hauptregex, versuche Alternative...');
          
          // Alternative Regex für andere Formate
          const altTaskRegex = /(\d+)\.\s+\*\*([^*\n]+)[:\*]*\s*([^\n]+)/g;
          taskCount = 0;
          
          while ((match = altTaskRegex.exec(nextStepsText)) !== null && taskCount < 3) {
            taskCount++;
            const taskTitle = match[2].trim();
            const taskDescription = match[3].trim();
            
            tasks.push({
              title: `${taskTitle}: ${taskDescription}`,
              user_id: userId,
              lead_id: leadId,
              color: '#FFE2DD',
              priority: 'High',
              order_index: taskCount - 1,
              created_at: new Date().toISOString()
            });
          }
        }
        
        // Letzter Fallback für einfache nummerierte Listen
        if (tasks.length === 0) {
          console.log('⚠️ Kein Task-Match mit alternativer Regex, verwende einfache Nummerierung...');
          
          const simpleTaskRegex = /(\d+)\.\s+([^\n]+)/g;
          taskCount = 0;
          
          while ((match = simpleTaskRegex.exec(nextStepsText)) !== null && taskCount < 3) {
            taskCount++;
            tasks.push({
              title: match[2].trim(),
              user_id: userId,
              lead_id: leadId,
              color: '#FFE2DD',
              priority: 'High',
              order_index: taskCount - 1,
              created_at: new Date().toISOString()
            });
          }
        }
        
        // Wenn Tasks gefunden wurden, speichere sie in der Datenbank
        if (tasks.length > 0) {
          console.log(`✅ ${tasks.length} Tasks aus der Analyse erstellt:`, tasks.map(t => t.title));
          
          const { data: createdTasks, error: taskError } = await supabase
            .from('tasks')
            .insert(tasks)
            .select();
          
          if (taskError) {
            console.error('❌ Fehler beim Erstellen der Tasks:', taskError);
          } else {
            console.log('✅ Tasks erfolgreich erstellt:', createdTasks.length);
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
