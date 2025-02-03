import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadSummaryRequest {
  leadId: string;
}

async function generateUniqueMessage(lead, posts, openAiApiKey) {
  const postDetails = posts.map((post) => {
    return `Plattform: ${post.platform}, Typ: ${post.post_type}, Inhalt: "${post.content}", Likes: ${post.likes_count}, Kommentare: ${post.comments_count}, Hashtags: ${(post.hashtags || []).join(", ")}`;
  }).join("\n");

  const prompt = `
Du bist ein KI-Experte im Vertrieb. Analysiere die folgenden Informationen über einen Lead und erstelle eine personalisierte Nachricht, die eine emotionale Verbindung herstellt und den Lead zu einem Gespräch motiviert:

Lead-Informationen:
- Name: ${lead.name}
- Branche: ${lead.industry || "Unbekannt"}
- Interessen: ${(lead.social_media_interests || []).join(", ")}
- Letzte Interaktion: ${lead.last_interaction_date || "Unbekannt"}
- Engagement-Level: ${posts.length > 0 ? "Aktiv" : "Wenig aktiv"}
- Social-Media-Posts:
${postDetails}

Erstelle eine freundliche, einladende und professionelle Nachricht, die individuell auf diesen Lead abgestimmt ist.`;

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

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${await response.text()}`);
  }

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

    const { leadId } = await req.json() as LeadSummaryRequest;

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

    const totalEngagement = posts.reduce(
      (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0),
      0
    );

    // Analyze current phase and status
    const currentPhase = lead.phase_id;
    const { data: phaseData } = await supabase
      .from("pipeline_phases")
      .select("name")
      .eq("id", currentPhase)
      .single();

    const phaseName = phaseData?.name || "Unbekannte Phase";

    // Dynamische Nachricht mit OpenAI generieren
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY")!;
    const messageSuggestion = await generateUniqueMessage(lead, posts, openAiApiKey);

    const strategy = `
Basierend auf der Analyse empfehle ich folgende Vorgehensweise:

1. Personalisierte Erstansprache:
   - Beziehe dich auf die Interessen: ${(lead.social_media_interests || []).join(", ")}
   - Nutze die Branchenexpertise: ${lead.industry || "Noch nicht erfasst"}

2. Vorgeschlagene Nachricht:
   ${messageSuggestion}

3. Follow-up Strategie:
   - Nach 2-3 Tagen ohne Antwort: Sanfte Erinnerung mit Mehrwert
   - Social Media Engagement aufbauen durch Likes und relevante Kommentare`;

    const summary = {
      strategy,
      phaseName,
      totalEngagement,
      lastInteraction: lead.last_interaction_date,
    };

    return new Response(
      JSON.stringify(summary),
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
      JSON.stringify({ error: error.message }),
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
