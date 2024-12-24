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
    console.log('Received request to generate lead summary');
    const { leadId, language = "de" } = await req.json();
    console.log('Request parameters:', { leadId, language });

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching lead data from Supabase');
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
      console.error('Error fetching lead data:', leadError);
      throw leadError;
    }

    console.log('Lead data fetched successfully');

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = language === "de" 
      ? "Du bist ein hilfreicher Assistent, der Zusammenfassungen von Leads und deren Kommunikationsverläufen erstellt. Fasse die wichtigsten Informationen kurz und prägnant auf Deutsch zusammen."
      : "You are a helpful assistant that creates summaries of leads and their communication history. Summarize the key information concisely in English.";

    console.log('Generating summary with OpenAI');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
              Branche: ${lead.industry || 'Nicht angegeben'}
              Phase: ${lead.phase}
              Kontakttyp: ${lead.contact_type || 'Nicht festgelegt'}
              Firma: ${lead.company_name || 'Nicht angegeben'}
              Telefon: ${lead.phone_number || 'Nicht angegeben'}
              Email: ${lead.email || 'Nicht angegeben'}
              Letzte Aktion: ${lead.last_action || 'Keine'}
              Notizen: ${lead.notes || 'Keine'}
              
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
              **Geschäftsprofil**: [Branche und wichtige Geschäftsinformationen]
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
    console.log('Summary generated successfully');

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
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