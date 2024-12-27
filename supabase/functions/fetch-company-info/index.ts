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

    console.log('Fetching information for company:', companyName);

    const prompt = `
      Analyze the network marketing company "${companyName}" and provide the following information in a structured format:
      - Company name (official name)
      - Main products or services offered
      - Primary target audience
      - Unique selling proposition (USP)
      - Brief business description
      
      If you're not certain about specific details, provide general, positive information about network marketing companies in that industry.
      Keep all responses professional and factual.
      
      Format the response as a JSON object with these exact keys:
      companyName, productsServices, targetAudience, usp, businessDescription
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
          { 
            role: 'system', 
            content: 'You are a helpful assistant that provides accurate information about network marketing companies in JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to fetch company information from OpenAI');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    // Extract the content from the response
    const content = data.choices[0].message.content;
    console.log('Content from OpenAI:', content);

    // Try to parse the content as JSON, or extract JSON from markdown
    let companyInfo;
    try {
      // First try direct JSON parsing
      companyInfo = JSON.parse(content);
    } catch (e) {
      console.log('Direct JSON parse failed, trying to extract JSON from content');
      // If direct parsing fails, try to extract JSON from potential markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        companyInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse company information from OpenAI response');
      }
    }

    console.log('Parsed company info:', companyInfo);

    return new Response(JSON.stringify(companyInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-company-info function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'If this error persists, please try again or contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});