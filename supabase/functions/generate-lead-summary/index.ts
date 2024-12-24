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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lead data with related information
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
        )
      `)
      .eq('id', leadId)
      .single();

    if (leadError) {
      throw leadError;
    }

    // Format lead data for OpenAI
    const systemPrompt = language === "en" 
      ? "You are a helpful assistant that creates summaries of leads and their communication history. Summarize the key information concisely in English."
      : "Du bist ein hilfreicher Assistent, der Zusammenfassungen von Leads und deren Kommunikationsverlauf erstellt. Fasse die wichtigsten Informationen kurz und prägnant auf Deutsch zusammen.";

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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `
              Erstelle eine Zusammenfassung für diesen Lead:
              Name: ${lead.name}
              Plattform: ${lead.platform}
              Kontakttyp: ${lead.contact_type || 'Nicht festgelegt'}
              Firma: ${lead.company_name || 'Nicht angegeben'}
              Phase: ${lead.phase}
              Letzte Aktion: ${lead.last_action || 'Keine'}
              
              Nachrichten:
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
              
              Formatiere die Zusammenfassung mit folgenden Kategorien:
              **Kontaktstatus**: [Phase und letzte Interaktion]
              **Geschäftsprofil**: [Wichtige Geschäftsinformationen]
              **Kommunikationsverlauf**: [Zusammenfassung der Nachrichten]
              **Nächste Schritte**: [Empfehlungen basierend auf dem aktuellen Status]
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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