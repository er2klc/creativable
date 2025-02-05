
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadSummaryRequest {
  leadId: string;
  language?: string;
}

async function generateUniqueMessage(lead, posts, settings, openAiApiKey) {
  console.log('Generating message for lead:', lead.name);
  
  const postDetails = posts.map((post) => {
    return `Platform: ${post.platform}, Art: ${post.post_type}, Inhalt: "${post.content}", Likes: ${post.likes_count || 0}, Kommentare: ${post.comments_count || 0}, Hashtags: ${(post.hashtags || []).join(", ")}`;
  }).join("\n");

  const languageStr = settings?.language === 'en' ? 'English' : 'German';
  const businessContext = `
Dein Business-Kontext:
- Dein Name/Marke: ${settings?.company_name || "Nicht angegeben"}
- Deine Produkte/Services: ${settings?.products_services || "Nicht angegeben"}
- Deine Zielgruppe: ${settings?.target_audience || "Nicht angegeben"}
- Dein USP: ${settings?.usp || "Nicht angegeben"}
- Deine Geschäftsbeschreibung: ${settings?.business_description || "Nicht angegeben"}
`;

  const prompt = `
Du bist ein erfahrener KI-Vertriebsexperte. Analysiere die folgenden Daten und erstelle eine präzise, strategische Zusammenfassung mit Gesprächsvorschlägen.

${businessContext}

Lead-Informationen:
🎯 Basis-Daten:
- Name: ${lead.name}
- Branche: ${lead.industry || "Unbekannt"}
- Aktuelle Position: ${lead.position || "Unbekannt"}
- Firma: ${lead.company_name || "Unbekannt"}
- Lead Status: ${lead.status || "Neu"}
- Pipeline Phase: ${lead.pipeline_phases?.name || "Unbekannt"}

👥 Social Media Profil:
- Interessen: ${(lead.social_media_interests || []).join(", ")}
- Bio: ${lead.social_media_bio || "Keine Bio verfügbar"}
- Follower: ${lead.social_media_followers || "Unbekannt"}
- Following: ${lead.social_media_following || "Unbekannt"}
- Engagement Rate: ${lead.social_media_engagement_rate ? (lead.social_media_engagement_rate * 100).toFixed(2) + "%" : "Unbekannt"}

📊 Engagement Historie:
- Letzte Interaktion: ${lead.last_interaction_date ? new Date(lead.last_interaction_date).toLocaleDateString() : "Keine"}
- Anzahl Posts: ${posts.length}
- Social Media Posts:
${postDetails}

Erstelle eine strukturierte Analyse mit den folgenden Abschnitten in ${languageStr}:

1. 🧠 KONTAKT-ANALYSE (2-3 Sätze)
- Wichtigste Erkenntnisse über den Lead
- Aktuelle Situation und Potenzial

2. 💡 STRATEGISCHE EMPFEHLUNG (2-3 konkrete Punkte)
- Basierend auf der Analyse
- Spezifische nächste Schritte

3. 💬 NACHRICHTENVORSCHLÄGE (3 verschiedene Stile)
A) Professionell & Business-Fokussiert
B) Persönlich & Vertrauensaufbauend
C) Direkt & Abschlussorientiert

4. 🎯 GEMEINSAMKEITEN & GESPRÄCHSAUFHÄNGER (2-3 Punkte)
- Verbindungspunkte zwischen Lead und Business
- Konkrete Gesprächseinstiege

Halte die Antwort prägnant und handlungsorientiert.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "Du bist ein erfahrener Vertriebsexperte, der präzise, umsetzbare Strategien entwickelt. Fokussiere dich auf praktische, personalisierte Empfehlungen." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { leadId, language = 'de' } = await req.json() as LeadSummaryRequest;

    console.log("Generating summary for lead:", leadId);

    // Fetch lead data with all related information
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select(`
        *,
        messages (*),
        tasks (*),
        notes (*),
        social_media_posts (*),
        lead_files (*),
        pipeline_phases (name)
      `)
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      throw new Error("Lead nicht gefunden.");
    }

    const { data: posts, error: postsError } = await supabase
      .from("social_media_posts")
      .select("*")
      .eq("lead_id", leadId);

    if (postsError) {
      throw new Error("Social-Media-Posts konnten nicht abgerufen werden.");
    }

    // Get user's settings for business context and OpenAI API key
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", lead.user_id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      throw new Error("OpenAI API-Key nicht gefunden.");
    }

    // Generate personalized message with OpenAI
    const summary = await generateUniqueMessage(lead, posts, settings, settings.openai_api_key);

    if (!summary) {
      throw new Error("Fehler bei der Generierung der KI-Nachricht.");
    }

    // Upsert the summary in the database
    const { error: upsertError } = await supabase
      .from("lead_summaries")
      .upsert({
        lead_id: leadId,
        summary: summary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'lead_id'
      });

    if (upsertError) {
      console.error("Error upserting summary:", upsertError);
      throw new Error("Fehler beim Speichern der Zusammenfassung");
    }

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in generate-lead-summary:", error);

    return new Response(
      JSON.stringify({ 
        error: error.message || "Ein unerwarteter Fehler ist aufgetreten" 
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
