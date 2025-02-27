
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request data
    const { leadId, userName, scriptType, leadData, existingAnalysis, settings } = await req.json();
    
    if (!leadId || !userName) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating call script for lead: ${leadId}, user: ${userName}, script type: ${scriptType}`);

    // Use existing analysis or get lead data
    let lead = leadData;
    if (!lead) {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          social_media_posts:social_media_posts(content, platform, posted_at, likes_count, comments_count),
          notes:notes(content, created_at)
        `)
        .eq('id', leadId)
        .single();

      if (error) throw error;
      lead = data;
    }

    // Get existing phase analysis if not provided
    let analysis = existingAnalysis || '';
    if (!analysis) {
      const { data, error } = await supabase
        .from('phase_based_analyses')
        .select('content')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (!error && data) {
        analysis = data.content;
      }
    }

    // Determine script context based on type
    let scriptContext = "";
    const language = settings?.language || 'de';
    
    if (language === 'en') {
      switch(scriptType) {
        case 'introduction':
          scriptContext = "This is a first call script. Focus on introduction, building rapport, and identifying initial needs.";
          break;
        case 'follow_up':
          scriptContext = "This is a follow-up call script. Reference previous interactions and focus on advancing the relationship.";
          break;
        case 'closing':
          scriptContext = "This is a closing call script. Focus on overcoming objections and moving to a commitment or decision.";
          break;
      }
    } else {
      switch(scriptType) {
        case 'introduction':
          scriptContext = "Dies ist ein Erstgespräch-Script. Fokus auf Vorstellung, Aufbau von Rapport und Identifizierung erster Bedürfnisse.";
          break;
        case 'follow_up':
          scriptContext = "Dies ist ein Folgegespräch-Script. Auf vorherige Interaktionen Bezug nehmen und den Fokus auf die Weiterentwicklung der Beziehung legen.";
          break;
        case 'closing':
          scriptContext = "Dies ist ein Abschluss-Script. Fokus auf Überwindung von Einwänden und Herbeiführung einer Entscheidung oder Zusage.";
          break;
      }
    }

    // Extract recent posts and notes for additional context
    const recentPosts = lead.social_media_posts 
      ? lead.social_media_posts.slice(0, 3).map(post => post.content).join('\n\n')
      : '';
      
    const recentNotes = lead.notes
      ? lead.notes.slice(0, 3).map(note => note.content).join('\n\n')
      : '';

    // Prepare system prompt based on language
    const systemPrompt = language === 'en'
      ? `You are an elite sales coach creating an effective telephone script for ${userName}. 
         Create a detailed, realistic call script for ${scriptType} call with ${lead.name}.
         ${scriptContext}
         The script should include exact wording to use, with clear sections for:
         1. Opening/Introduction
         2. Main conversation with questions and responses
         3. Handling objections
         4. Call to action and closing

         Format the script with markdown, use ** for emphasis and ## for section headers.
         Keep the script natural, conversational and authentic.`
      
      : `Du bist ein Elite-Verkaufscoach und erstellst ein effektives Telefonscript für ${userName}.
         Erstelle ein detailliertes, realistisches Telefonscript für ein ${scriptType === 'introduction' ? 'Erstgespräch' : scriptType === 'follow_up' ? 'Folgegespräch' : 'Abschlussgespräch'} mit ${lead.name}.
         ${scriptContext}
         Das Script sollte genaue Formulierungen enthalten, mit klaren Abschnitten für:
         1. Eröffnung/Einleitung
         2. Hauptgespräch mit Fragen und Antworten
         3. Umgang mit Einwänden
         4. Handlungsaufforderung und Abschluss

         Formatiere das Script mit Markdown, verwende ** für Hervorhebungen und ## für Abschnittsüberschriften.
         Halte das Script natürlich, konversationell und authentisch.`;

    // Prepare user prompt with lead info and context
    const userPrompt = JSON.stringify({
      lead: {
        name: lead.name,
        platform: lead.platform,
        industry: lead.industry || 'Not specified',
        position: lead.position,
        company_name: lead.company_name,
        social_media_username: lead.social_media_username,
        social_media_bio: lead.social_media_bio,
        email: lead.email,
        phone_number: lead.phone_number,
      },
      existing_analysis: analysis,
      recent_social_media_posts: recentPosts,
      recent_notes: recentNotes,
      caller_name: userName
    });

    // Generate script using OpenAI
    console.log('Sending request to OpenAI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate script' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    const script = openAIData.choices[0].message.content;

    console.log('Script generated successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        script
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
