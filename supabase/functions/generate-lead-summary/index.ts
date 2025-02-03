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

    // Fetch comprehensive lead data
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
          engagement_rate
        ),
        lead_files (
          file_name,
          created_at
        )
      `)
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    const systemPrompt = language === "en" 
      ? "You are a helpful AI assistant that analyzes lead data and provides actionable insights and recommendations. Focus on helping users convert leads into customers or partners."
      : "Du bist ein hilfreicher KI-Assistent, der Kontaktdaten analysiert und umsetzbare Erkenntnisse und Empfehlungen gibt. Konzentriere dich darauf, Benutzern zu helfen, Leads in Kunden oder Partner umzuwandeln.";

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
              Analysiere diese Kontaktdaten und erstelle eine detaillierte Zusammenfassung mit Handlungsempfehlungen:
              
              Basis Informationen:
              Name: ${lead.name}
              Plattform: ${lead.platform}
              Kontakttyp: ${lead.contact_type || 'Nicht festgelegt'}
              Firma: ${lead.current_company_name || 'Nicht angegeben'}
              Position: ${lead.position || 'Nicht angegeben'}
              Phase: ${lead.phase_id}
              
              Interessen/Skills:
              ${lead.social_media_interests ? lead.social_media_interests.join(', ') : 'Keine angegeben'}
              
              Social Media Profil:
              Follower: ${lead.social_media_followers || 'Nicht verfügbar'}
              Following: ${lead.social_media_following || 'Nicht verfügbar'}
              Engagement Rate: ${lead.social_media_engagement_rate || 'Nicht verfügbar'}
              Bio: ${lead.social_media_bio || 'Nicht verfügbar'}
              
              Kommunikationsverlauf:
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
              ${lead.social_media_posts?.map((post: any) => 
                `- ${new Date(post.posted_at).toLocaleDateString()}: ${post.content} (Engagement: ${post.engagement_rate || 'N/A'})`
              ).join('\n') || 'Keine Social Media Aktivitäten'}

              Formatiere die Zusammenfassung mit folgenden Kategorien:
              **Kontaktstatus**: [Aktuelle Phase und letzte Interaktionen]
              **Geschäftsprofil**: [Wichtige geschäftliche Informationen]
              **Kommunikationsverlauf**: [Zusammenfassung der bisherigen Kommunikation]
              **Interessen & Engagement**: [Analyse der Interessen und Social Media Aktivitäten]
              **Handlungsempfehlungen**: [Konkrete nächste Schritte basierend auf allen Daten]
              ${lead.phase_id.includes('erstkontakt') || lead.phase_id.includes('neukontakt') ? 
                '**Vorgeschlagene Erstnachricht**: [Personalisierter Vorschlag für die erste Kontaktaufnahme]' : 
                ''
              }
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