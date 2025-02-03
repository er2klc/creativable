import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadSummaryRequest {
  leadId: string;
  userId: string;
}

async function generateUniqueMessage(lead, posts, openAiApiKey) {
  const postDetails = posts.map((post) => {
    return `Plattform: ${post.platform}, Typ: ${post.post_type}, Inhalt: "${post.content}", Likes: ${post.likes_count}, Kommentare: ${post.comments_count}, Hashtags: ${(post.hashtags || []).join(", ")}`;
  }).join("\n");

  const prompt = `
Du bist ein KI-Experte im Bereich Vertrieb und Lead-Generierung. Analysiere die folgenden Informationen über den Lead und erstelle eine personalisierte, emotionale und überzeugende Nachricht, die den Kontakt triggert, ein Gespräch mit dem Benutzer zu beginnen:
- Name: ${lead.name}
- Branche: ${lead.industry || "Unbekannt"}
- Interessen: ${(lead.social_media_interests || []).join(", ")}
- Letzte Interaktion: ${lead.last_interaction_date || "Unbekannt"}
- Engagement-Level: ${posts.length > 0 ? "Aktiv" : "Wenig aktiv"}
- Social-Media-Posts:
${postDetails}

Schreibe die Nachricht so, dass sie auf den Kontakt abgestimmt ist und eine emotionale Verbindung aufbaut. Füge Vorschläge hinzu, wie der Benutzer Mehrwert bieten kann, und motiviere den Lead zu einem Gespräch. Nutze einen warmen, einladenden Ton.`;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      prompt,
      max_tokens: 250,
      temperature: 0.9,
    }),
  });

  const data = await response.json();
  return data.choices[0].text.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { leadId, userId } = await req.json() as LeadSummaryRequest;

    // Holen des API-Keys aus der Settings-Tabelle
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("openai_api_key")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings) {
      throw new Error("API-Key für OpenAI nicht gefunden.");
    }

    const openAiApiKey = settings.openai_api_key;

    // Holen des Lead-Datensatzes
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select(`
        *,
        messages (*),
        tasks (*),
        notes (*),
        lead_files (*),
        pipeline_phases (name)
      `)
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      throw new Error("Lead nicht gefunden.");
    }

    // Holen der Social-Media-Posts
    const { data: posts, error: postsError } = await supabase
      .from("social_media_posts")
      .select("*")
      .eq("lead_id", leadId);

    if (postsError) {
      throw new Error("Fehler beim Abrufen der Social-Media-Posts.");
    }

    const totalEngagement = posts.reduce(
      (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0),
      0
    );

    let successProbability = "🌱 Cold Lead";
    if (totalEngagement > 100 || lead.messages.length > 5) successProbability = "🔥 Hot Lead";
    else if (totalEngagement > 50) successProbability = "⚡ Warm Lead";

    const persona = `
${lead.name} ist eine ${lead.industry || "branchenneutrale"} Person mit Interessen an ${(lead.social_media_interests || []).join(", ")}.
Sie/Er interagiert regelmäßig auf Social Media mit einem Engagement-Level von ${
      totalEngagement > 100 ? "hoch" : "moderat"
    }. Aktuelle Phase: ${lead.pipeline_phases?.name || "Unbekannt"}`;

    const messageSuggestion = await generateUniqueMessage(lead, posts, openAiApiKey);

    let nextAction = "Schicke eine Nachricht";
    if (lead.messages.length === 0) nextAction = "Erstkontakt per Social Media (Like & Kommentar)";
    else if (lead.messages.length > 5) nextAction = "Ein Gespräch vorschlagen";

    let socialTrigger = "Kein neuer Post gefunden";
    if (posts.length > 0) {
      const latestPost = posts[posts.length - 1];
      socialTrigger = `Letzter Post: "${latestPost.content}" → Jetzt liken & kommentieren!`;
    }

    const summary = {
      persona,
      successProbability,
      messageSuggestion,
      nextAction,
      socialTrigger,
      phaseName: lead.pipeline_phases?.name || "Unbekannt",
      lastInteraction: lead.last_interaction_date,
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-lead-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
