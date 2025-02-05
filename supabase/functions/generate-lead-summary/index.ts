
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

async function generateUniqueMessage(lead, posts, openAiApiKey) {
  const postDetails = posts.map((post) => {
    return `Plattform: ${post.platform}, Typ: ${post.post_type}, Inhalt: "${post.content}", Likes: ${post.likes_count}, Kommentare: ${post.comments_count}, Hashtags: ${(post.hashtags || []).join(", ")}`;
  }).join("\n");

  const prompt = `
Analysiere die folgenden Lead-Informationen und erstelle eine kurze, prägnante Zusammenfassung mit konkreten nächsten Schritten:

Lead-Informationen:
- Name: ${lead.name}
- Branche: ${lead.industry || "Unbekannt"}
- Interessen: ${(lead.social_media_interests || []).join(", ")}
- Letzte Interaktion: ${lead.last_interaction_date || "Unbekannt"}
- Engagement-Level: ${posts.length > 0 ? "Aktiv" : "Wenig aktiv"}
- Social-Media-Posts:
${postDetails}

Erstelle eine kurze, präzise Zusammenfassung (max. 2-3 Sätze) und einen konkreten Vorschlag für den nächsten Schritt.`;

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
          { role: "system", content: "Du bist ein erfahrener Vertriebsexperte, der Leads analysiert und präzise, umsetzbare Strategien entwickelt." },
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

    const totalEngagement = posts.reduce(
      (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0),
      0
    );

    // Get user's OpenAI API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("openai_api_key")
      .eq("user_id", lead.user_id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      throw new Error("OpenAI API-Key nicht gefunden.");
    }

    // Generate personalized message with OpenAI
    const messageSuggestion = await generateUniqueMessage(lead, posts, settings.openai_api_key);

    if (!messageSuggestion) {
      throw new Error("Fehler bei der Generierung der KI-Nachricht.");
    }

    const summary = `
**Kontaktstatus:**
Aktuell in Phase "${lead.pipeline_phases?.name || 'Unbekannt'}" mit ${totalEngagement} Interaktionen in den letzten 30 Tagen.

**Geschäftsprofil:**
${lead.industry ? `Tätig in der Branche ${lead.industry}` : "Branche noch nicht erfasst"}
${lead.company_name ? `\nFirma: ${lead.company_name}` : ""}
${lead.social_media_bio ? `\nSelbstbeschreibung: ${lead.social_media_bio}` : ""}

**Kommunikationsverlauf:**
${lead.messages?.length || 0} Nachrichten ausgetauscht
${lead.notes?.length || 0} Notizen erfasst
Letzte Interaktion: ${new Date(lead.last_interaction_date || lead.created_at).toLocaleDateString()}

**Nächste Schritte:**
${messageSuggestion}`;

    // Upsert the summary in the database
    const { error: upsertError } = await supabase
      .from("lead_summaries")
      .upsert({
        lead_id: leadId,
        summary: summary,
        strategy: messageSuggestion
      }, {
        onConflict: 'lead_id'
      });

    if (upsertError) {
      console.error("Error upserting summary:", upsertError);
      throw new Error("Fehler beim Speichern der Zusammenfassung");
    }

    return new Response(
      JSON.stringify({ 
        summary, 
        strategy: messageSuggestion,
        totalEngagement, 
        lastInteraction: lead.last_interaction_date 
      }),
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
