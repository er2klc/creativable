
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
    console.log("Received request params:", { leadId, phaseId, userId });
    
    if (!leadId || !phaseId || !userId) {
      throw new Error("Missing required parameters");
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      console.error("OpenAI API key not found");
      throw new Error("OpenAI API key not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting analysis generation for:", { leadId, phaseId, userId });

    // Fetch lead data
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

    // OpenAI configuration
    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    // Build context for analysis
    const context = {
      name: lead.name,
      phase: lead.phase?.name,
      notes: lead.notes?.map(n => n.content).join('\n'),
      messages: lead.messages?.map(m => m.content).join('\n'),
      tasks: lead.tasks?.map(t => t.title).join('\n'),
      socialMediaBio: lead.social_media_bio,
      industry: lead.industry
    };

    // Generate analysis
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Du bist ein KI-Assistent, der Kontaktanalysen erstellt. 
          Analysiere die gegebenen Informationen und erstelle:
          1. Eine kurze Zusammenfassung
          2. 3-5 Kernpunkte
          3. 2-3 konkrete Handlungsempfehlungen
          Formatiere die Ausgabe strukturiert mit den Überschriften "Zusammenfassung:", "Kernpunkte:" und "Empfehlungen:"`
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

    // Extract sections
    const sections = {
      summary: "",
      keyPoints: [] as string[],
      recommendations: [] as string[]
    };

    // Simple parsing of the sections
    const parts = analysis.split(/(?:Zusammenfassung:|Kernpunkte:|Empfehlungen:)/g).filter(Boolean);
    if (parts.length >= 1) sections.summary = parts[0].trim();
    if (parts.length >= 2) sections.keyPoints = parts[1].trim().split('\n').filter(p => p.trim()).map(p => p.replace(/^[•-]\s*/, ''));
    if (parts.length >= 3) sections.recommendations = parts[2].trim().split('\n').filter(p => p.trim()).map(p => p.replace(/^[•-]\s*/, ''));

    console.log("Generated analysis sections:", sections);

    // Save analysis in database
    const { data: insertData, error: insertError } = await supabase
      .from('phase_based_analyses')
      .upsert({
        lead_id: leadId,
        phase_id: phaseId,
        created_by: userId,  // Using created_by instead of user_id
        content: analysis,
        metadata: {
          analysis: {
            summary: sections.summary,
            key_points: sections.keyPoints,
            recommendations: sections.recommendations
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
        message: "Analysis generated successfully",
        data: insertData
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
