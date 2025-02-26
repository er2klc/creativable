
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, phaseId, userId } = await req.json();
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAiKey) {
      console.error("OpenAI API key not found");
      throw new Error("OpenAI API key not configured");
    }

    // Supabase client initialisieren
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting analysis generation for:", { leadId, phaseId, userId });

    // Lead Daten abrufen
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        notes (content, created_at),
        messages (content, created_at),
        tasks (title, created_at),
        phase:phase_id (name)
      `)
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error("Error fetching lead data:", leadError);
      throw leadError;
    }

    if (!lead) {
      throw new Error("Lead not found");
    }

    // OpenAI Konfiguration
    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    // Kontext für die Analyse aufbauen
    const context = {
      name: lead.name,
      phase: lead.phase?.name,
      notes: lead.notes?.map(n => n.content).join('\n'),
      messages: lead.messages?.map(m => m.content).join('\n'),
      tasks: lead.tasks?.map(t => t.title).join('\n'),
      socialMediaBio: lead.social_media_bio,
      industry: lead.industry
    };

    // Analyse generieren
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist ein KI-Assistent, der Kontaktanalysen erstellt. Fasse die wichtigsten Informationen zusammen und gib Handlungsempfehlungen."
        },
        {
          role: "user",
          content: `Analysiere diesen Kontakt in Phase "${context.phase}". Kontaktinformationen: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const analysis = completion.data.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error("No analysis generated");
    }

    // Analyse in der Datenbank speichern
    const { error: insertError } = await supabase
      .from('phase_based_analyses')
      .upsert({
        lead_id: leadId,
        phase_id: phaseId,
        user_id: userId,
        content: analysis,
        metadata: {
          analysis: {
            summary: analysis,
            key_points: [], // TODO: Extrahiere Key Points
            recommendations: [] // TODO: Extrahiere Empfehlungen
          }
        }
      });

    if (insertError) {
      console.error("Error saving analysis:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Analysis generated successfully" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('Error in generate-phase-analysis:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
