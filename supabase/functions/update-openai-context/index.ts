import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, products_services, target_audience, usp, business_description } = await req.json();

    // Create a system message that OpenAI will use to understand the context
    const systemMessage = `
      Company Information:
      - Name: ${company_name}
      - Products/Services: ${products_services}
      - Target Audience: ${target_audience}
      - Unique Selling Proposition: ${usp}
      - Business Description: ${business_description}

      Please use this information to provide personalized and contextually relevant responses.
    `;

    // Store this context in OpenAI's memory
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
            content: 'You are an AI assistant that helps with MLM business communications.',
          },
          {
            role: 'user',
            content: `Please acknowledge and remember the following business context: ${systemMessage}`,
          },
        ],
      }),
    });

    const data = await openAiResponse.json();
    console.log('OpenAI response:', data);
    
    return new Response(JSON.stringify({ success: true, message: 'Context updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-openai-context function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});