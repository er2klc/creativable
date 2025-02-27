
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
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const { companyName } = requestData;

    console.log('Fetching company info for:', {
      companyName,
      timestamp: new Date().toISOString()
    });

    if (!companyName) {
      console.error("Missing company name in request");
      return new Response(
        JSON.stringify({ error: "Company name is required" }),
        { 
          status: 400, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error("OpenAI API key not found in environment variables");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          status: 500, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
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
    
    Wichtig: Antworte ausschließlich mit einem validen JSON-Objekt ohne zusätzlichen Text oder Markdown-Formatierung.
    Das JSON sollte exakt die oben genannten Felder enthalten.
    `;

    console.log("Sending request to OpenAI API");
    
    try {
      // Call OpenAI API with the new model
      const response = await openai.createChatCompletion({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: "Du bist ein hilfreicher Business-Analyst, der Unternehmensinformationen extrahiert und strukturiert. Antworte immer mit einem validen JSON-Objekt."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      // Log the raw response for debugging
      console.log("OpenAI API response received. Status:", response.status);
      
      if (!response.data.choices || response.data.choices.length === 0) {
        console.error("No choices in OpenAI response");
        throw new Error("OpenAI returned an empty response");
      }

      const aiResponse = response.data.choices[0]?.message?.content || '';
      console.log("AI raw response:", aiResponse);

      // Try to parse the entire response as JSON first
      let companyInfo;
      try {
        companyInfo = JSON.parse(aiResponse);
        console.log("Successfully parsed response as direct JSON");
      } catch (e) {
        console.log("Could not parse direct JSON, trying to extract JSON from text");
        // If direct parsing fails, try to extract JSON from the text
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            companyInfo = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted and parsed JSON from text");
          } catch (e) {
            console.error("Error parsing extracted JSON:", e);
            throw new Error("Failed to parse company information from response");
          }
        } else {
          console.error("No JSON pattern found in response");
          throw new Error("No valid JSON found in AI response");
        }
      }

      // Validate the required fields
      const requiredFields = ['companyName', 'productsServices', 'targetAudience', 'usp', 'businessDescription'];
      const missingFields = requiredFields.filter(field => !companyInfo[field]);
      
      if (missingFields.length > 0) {
        console.warn(`Missing fields in parsed response: ${missingFields.join(', ')}`);
        // Fill in missing fields with placeholders
        missingFields.forEach(field => {
          companyInfo[field] = `Information zu ${field} nicht verfügbar`;
        });
      }

      console.log('Successfully generated company info:', {
        company: companyName,
        result: companyInfo,
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
      );
    } catch (openAiError) {
      console.error("Error calling OpenAI API:", openAiError);
      return new Response(
        JSON.stringify({ 
          error: "Error calling OpenAI API", 
          details: openAiError.message || "Unknown error",
          stack: openAiError.stack
        }),
        { 
          status: 500, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error in fetch-company-info:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message || "Unknown error",
        stack: error.stack
      }),
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
