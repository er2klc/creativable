
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

    if (leadError) throw leadError;

    if (!lead) {
      throw new Error("Lead not found");
    }

    // OpenAI Analyse durchführen
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes contact interactions and provides insights.'
          },
          {
            role: 'user',
            content: `Analyze this contact in phase "${lead.phase.name}". Contact info: ${JSON.stringify(lead)}`
          }
        ],
      }),
    });

    const analysis = await response.json();
    
    if (!analysis.choices || !analysis.choices[0]) {
      throw new Error("Failed to generate analysis");
    }

    // Analyse in der Datenbank speichern
    const { error: insertError } = await supabase
      .from('phase_based_analyses')
      .insert({
        lead_id: leadId,
        phase_id: phaseId,
        content: analysis.choices[0].message.content,
        created_by: userId,
        completed: true,
        completed_at: new Date().toISOString(),
        analysis_type: 'phase_analysis'
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      success: true,
      message: "Analysis generated successfully" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-phase-analysis:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
