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
    const { leadId } = await req.json();
    console.log('Generating summary for lead:', leadId);

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch lead data with messages and tasks
    const { data: lead, error } = await supabaseClient
      .from('leads')
      .select(`
        *,
        messages (content, sent_at),
        tasks (title, completed, due_date)
      `)
      .eq('id', leadId)
      .single();

    if (error) {
      console.error('Error fetching lead data:', error);
      throw error;
    }

    console.log('Lead data fetched successfully');

    // Generate a prompt for the AI
    const prompt = `Please provide a concise summary of this lead:
    Name: ${lead.name}
    Industry: ${lead.industry}
    Platform: ${lead.platform}
    Phase: ${lead.phase}
    Last Action: ${lead.last_action || 'None'}
    
    Messages (${lead.messages.length}):
    ${lead.messages.map((m: any) => `- ${m.content}`).join('\n')}
    
    Tasks (${lead.tasks.length}):
    ${lead.tasks.map((t: any) => `- ${t.title} (${t.completed ? 'Completed' : 'Pending'})`).join('\n')}
    
    Please analyze this information and provide:
    1. Current status summary
    2. Key interactions
    3. Next recommended actions`;

    // Call OpenAI API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes lead information and provides concise, actionable summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await openAiResponse.json();
    console.log('OpenAI response received');
    const summary = data.choices[0].message.content;

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