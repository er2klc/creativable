
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const requestData = await req.json()
    const { companyName } = requestData

    console.log('Fetching company info for:', {
      companyName,
      timestamp: new Date().toISOString()
    })

    if (!companyName) {
      throw new Error('Company name is required')
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    const openai = new OpenAIApi(configuration);

    // Prompt for OpenAI to analyze the company
    const prompt = `
    Als Business-Analyst, analysiere dieses Unternehmen: "${companyName}".
    
    Extrahiere und formatiere die folgenden Informationen in einem JSON-Format:
    1. companyName: Den genauen Firmennamen
    2. productsServices: Die wichtigsten Produkte und Dienstleistungen des Unternehmens (1-2 Sätze)
    3. targetAudience: Die Zielgruppe des Unternehmens (1-2 Sätze)
    4. usp: Das Alleinstellungsmerkmal/USP des Unternehmens (1-2 Sätze)
    5. businessDescription: Eine kurze Geschäftsbeschreibung (2-3 Sätze)
    
    Antworte nur mit dem JSON-Objekt, ohne zusätzlichen Text.
    `;

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Du bist ein hilfreicher Business-Analyst, der Unternehmensinformationen extrahiert und strukturiert."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const aiResponse = response.data.choices[0]?.message?.content || '';
    console.log('AI response received, processing...');

    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    let companyInfo;
    
    if (jsonMatch) {
      try {
        companyInfo = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Error parsing AI response:', e);
        throw new Error('Failed to parse company information');
      }
    } else {
      throw new Error('No valid JSON found in AI response');
    }

    console.log('Successfully generated company info:', {
      company: companyName,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify(companyInfo),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in fetch-company-info:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
