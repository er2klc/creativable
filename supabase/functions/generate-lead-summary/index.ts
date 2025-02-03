import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, language } = await req.json();
    console.log('Generating summary for lead:', leadId, 'in language:', language);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        messages (
          content,
          sent_at,
          platform
        ),
        tasks (
          title,
          completed,
          due_date
        ),
        notes (
          content,
          created_at
        ),
        social_media_posts (
          content,
          platform,
          posted_at,
          likes_count,
          comments_count,
          hashtags,
          location
        ),
        lead_files (
          file_name,
          created_at
        )
      `)
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead data:', leadError);
      throw leadError;
    }

    if (!lead) {
      throw new Error('Lead not found');
    }

    console.log('Successfully fetched lead data:', {
      name: lead.name,
      messageCount: lead.messages?.length,
      postsCount: lead.social_media_posts?.length
    });

    const systemPrompt = language === "en" 
      ? "You are a strategic AI sales assistant helping users convert leads into customers or partners. Focus on providing actionable strategies and personalized communication approaches. Be specific and practical in your recommendations."
      : "Du bist ein strategischer KI-Vertriebsassistent, der Benutzern hilft, Leads in Kunden oder Partner zu verwandeln. Konzentriere dich auf umsetzbare Strategien und personalisierte Kommunikationsansätze. Sei spezifisch und praktisch in deinen Empfehlungen.";

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `
              Analysiere diese Kontaktdaten und erstelle eine strategische Zusammenfassung mit konkreten Handlungsempfehlungen für mich als Vertriebsmitarbeiter:
              
              Basis Informationen:
              Name: ${lead.name}
              Plattform: ${lead.platform}
              Kontakttyp: ${lead.contact_type || 'Nicht festgelegt'}
              Firma: ${lead.current_company_name || 'Nicht angegeben'}
              Position: ${lead.position || 'Nicht angegeben'}
              Aktuelle Phase: ${lead.phase_id}
              
              Interessen/Skills:
              ${lead.social_media_interests ? lead.social_media_interests.join(', ') : 'Keine angegeben'}
              
              Social Media Profil:
              Follower: ${lead.social_media_followers || 'Nicht verfügbar'}
              Following: ${lead.social_media_following || 'Nicht verfügbar'}
              Bio: ${lead.social_media_bio || 'Nicht verfügbar'}
              
              Bisherige Kommunikation:
              ${lead.messages?.map((msg: any) => 
                `- ${new Date(msg.sent_at).toLocaleDateString()}: ${msg.content}`
              ).join('\n') || 'Keine Nachrichten'}
              
              Aufgaben:
              ${lead.tasks?.map((task: any) => 
                `- ${task.title} (${task.completed ? 'Erledigt' : 'Offen'})`
              ).join('\n') || 'Keine Aufgaben'}
              
              Notizen:
              ${lead.notes?.map((note: any) => 
                `- ${new Date(note.created_at).toLocaleDateString()}: ${note.content}`
              ).join('\n') || 'Keine Notizen'}
              
              Social Media Aktivitäten:
              ${lead.social_media_posts?.map((post: any) => {
                const engagement = post.likes_count + (post.comments_count || 0);
                return `- ${new Date(post.posted_at).toLocaleDateString()}: ${post.content} (Engagement: ${engagement})`
              }).join('\n') || 'Keine Social Media Aktivitäten'}

              Formatiere die Zusammenfassung mit folgenden Kategorien:
              **Kontaktstatus**: [Aktuelle Phase und Beziehungsanalyse]
              **Geschäftsprofil**: [Relevante geschäftliche Informationen und Potenzial]
              **Kommunikationsverlauf**: [Analyse der bisherigen Interaktionen]
              **Interessen & Engagement**: [Analyse der Interessen und Social Media Aktivitäten]
              **Handlungsempfehlungen**: [Konkrete nächste Schritte für mich als Vertriebsmitarbeiter]
              ${(lead.phase_id.includes('erstkontakt') || lead.phase_id.includes('neukontakt')) ? 
                '**Vorgeschlagene Erstnachricht**: [Personalisierter Vorschlag für die erste Kontaktaufnahme, der Interesse weckt und eine Antwort fördert]' : 
                ''
              }

              Wichtig: 
              - Fokussiere dich darauf, wie ICH den Kontakt als Kunde/Partner gewinnen kann
              - Gib konkrete, personalisierte Handlungsempfehlungen
              - Berücksichtige die aktuelle Phase in der Kommunikation
              - Nutze die Interessen und Social Media Aktivitäten für personalisierte Ansprache
              - Keine technischen Details oder IDs erwähnen
              - Sei präzise und handlungsorientiert
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-lead-summary function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});