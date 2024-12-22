import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching lead data from Supabase');
    // Fetch lead data with messages
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        messages (
          content,
          sent_at,
          platform
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

    console.log('Generating summary with OpenAI');
    // Generate summary with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: language === "de" 
              ? "Du bist ein Experte für die Analyse von Verkaufsgesprächen und Leads. Erstelle eine kurze, prägnante Zusammenfassung der wichtigsten Informationen und Interaktionen."
              : "You are an expert in analyzing sales conversations and leads. Create a brief, concise summary of the most important information and interactions."
          },
          {
            role: 'user',
            content: `
              ${language === "de" ? "Erstelle eine Zusammenfassung für diesen Lead:" : "Create a summary for this lead:"}
              
              ${language === "de" ? "Lead-Informationen:" : "Lead Information:"}
              - ${language === "de" ? "Name" : "Name"}: ${lead.name}
              - ${language === "de" ? "Plattform" : "Platform"}: ${lead.platform}
              - ${language === "de" ? "Branche" : "Industry"}: ${lead.industry}
              - ${language === "de" ? "Phase" : "Phase"}: ${lead.phase}
              
              ${language === "de" ? "Nachrichtenverlauf:" : "Message History:"}
              ${lead.messages.map((msg: any) => 
                `- ${new Date(msg.sent_at).toLocaleDateString()}: ${msg.content}`
              ).join('\n')}
              
              ${language === "de" ? "Zusätzliche Informationen:" : "Additional Information:"}
              ${lead.notes ? `${language === "de" ? "Notizen" : "Notes"}: ${lead.notes}` : ""}
              ${lead.company_name ? `${language === "de" ? "Firmenname" : "Company Name"}: ${lead.company_name}` : ""}
              ${lead.products_services ? `${language === "de" ? "Produkte/Services" : "Products/Services"}: ${lead.products_services}` : ""}
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
    });
  } catch (error) {
    console.error('Error in generate-lead-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});