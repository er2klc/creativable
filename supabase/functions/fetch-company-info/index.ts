import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { getSupabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, userId, isRegistration } = await req.json();

    if (!companyName) {
      throw new Error('Company name is required');
    }

    console.log('Fetching information for company:', companyName);

    // During registration, use the default key
    let openAIApiKey = null;
    if (isRegistration) {
      openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      console.log('Using default OpenAI key for registration');
    } else if (userId) {
      // For all other operations, try to get user's OpenAI API key
      const supabase = getSupabase();
      const { data: settings } = await supabase
        .from('settings')
        .select('openai_api_key')
        .eq('user_id', userId)
        .single();
      
      if (settings?.openai_api_key) {
        openAIApiKey = settings.openai_api_key;
        console.log('Using user OpenAI key');
      }
    }

    if (!openAIApiKey) {
      throw new Error('No OpenAI API key available. Please add your OpenAI API key in settings to use AI features.');
    }

    const systemPrompt = `You are a helpful assistant that analyzes network marketing companies and provides structured information. Always provide factual, professional information. If specific details are uncertain, provide general, positive information about companies in that industry.`;

    const userPrompt = `Please analyze the network marketing company "${companyName}" and provide the following specific information:

1. Official company name
2. Main products or services (be specific but concise)
3. Target audience (who are their ideal customers)
4. Unique selling proposition (what makes them special)
5. Business description (2-3 sentences about their business model and approach)

Format your response as a JSON object with these exact keys:
{
  "companyName": "string",
  "productsServices": "string",
  "targetAudience": "string",
  "usp": "string",
  "businessDescription": "string"
}`;

    console.log('Sending request to OpenAI with prompt');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to fetch company information from OpenAI');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    const content = data.choices[0].message.content;
    console.log('Content from OpenAI:', content);

    let companyInfo;
    try {
      companyInfo = JSON.parse(content);
    } catch (e) {
      console.log('Direct JSON parse failed, trying to extract JSON from content');
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        companyInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse company information from OpenAI response');
      }
    }

    // Validate that all required fields are present
    const requiredFields = ['companyName', 'productsServices', 'targetAudience', 'usp', 'businessDescription'];
    for (const field of requiredFields) {
      if (!companyInfo[field]) {
        companyInfo[field] = `Information about ${field} not available`;
      }
    }

    console.log('Parsed and validated company info:', companyInfo);

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