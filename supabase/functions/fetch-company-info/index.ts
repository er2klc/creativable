import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName } = await req.json();

    if (!companyName) {
      throw new Error('Company name is required');
    }

    const prompt = `
      Analyze the network marketing company "${companyName}" and provide the following information in a JSON format:
      - companyName: The official company name
      - productsServices: Main products or services offered
      - targetAudience: Primary target audience
      - usp: Unique selling proposition
      - businessDescription: A brief business description
      
      If you're not certain about specific details, provide general, positive information about network marketing companies in that industry.
      Keep all responses professional and factual.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides accurate information about network marketing companies.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company information');
    }

    const data = await response.json();
    const companyInfo = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(companyInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-company-info function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});