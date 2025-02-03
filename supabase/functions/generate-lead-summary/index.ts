import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadSummaryRequest {
  leadId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { leadId } = await req.json() as LeadSummaryRequest;
    console.log('Generating summary for lead:', leadId);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`*, messages (*), tasks (*), notes (*), social_media_posts (*), lead_files (*)`)
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }

    // Engagement Berechnung
    const socialPosts = lead.social_media_posts || [];
    const totalEngagement = socialPosts.reduce((sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0), 0);
    
    // Erfolgswahrscheinlichkeit bestimmen
    let successProbability = "🌱 Cold Lead";
    if (totalEngagement > 100 || lead.messages.length > 5) successProbability = "🔥 Hot Lead";
    else if (totalEngagement > 50) successProbability = "⚡ Warm Lead";
    
    // Dynamische Persona Erstellung
    const persona = `
${lead.name} ist eine ${lead.industry || 'branchenneutrale'} Person mit Interessen an ${(lead.social_media_interests || []).join(', ')}.
Sie/Er interagiert regelmäßig auf Social Media mit einem Engagement-Level von ${totalEngagement > 100 ? 'hoch' : 'moderat'}.`;
    
    // Nachrichtenvorschlag mit emotionalem Ton
    let messageStyle = "Neutral";
    if (lead.industry?.includes("Business")) messageStyle = "Formell & professionell";
    else if (lead.industry?.includes("Coaching")) messageStyle = "Inspirierend & motivierend";
    
    const messageSuggestion = `
"Hey ${lead.name}, ich sehe, dass du oft über ${lead.industry || 'interessante Themen'} postest.
Das ist auch mein Bereich! Ich hätte eine Strategie, die dich interessieren könnte. Lust auf einen kurzen Austausch?"`;
    
    // Nächste beste Aktion basierend auf dem Lead-Profil
    let nextAction = "Schicke eine Nachricht";
    if (lead.messages.length === 0) nextAction = "Erstkontakt per Social Media (Like & Kommentar)";
    else if (lead.messages.length > 5) nextAction = "Ein Gespräch vorschlagen";
    
    // Social-Media-Trigger
    let socialTrigger = "Kein neuer Post gefunden";
    if (socialPosts.length > 0) {
      const latestPost = socialPosts[socialPosts.length - 1];
      socialTrigger = `Letzter Post: "${latestPost.content}" → Jetzt liken & kommentieren!`;
    }
    
    const summary = {
      persona,
      successProbability,
      messageSuggestion,
      messageStyle,
      nextAction,
      socialTrigger,
      lastInteraction: lead.last_interaction_date,
    };

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-lead-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
