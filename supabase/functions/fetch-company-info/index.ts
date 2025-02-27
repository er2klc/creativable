
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hilfs-Funktion für CORS-Fehler
function corsError(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 400,
  })
}

// Hilfs-Funktion für normale Antworten
function corsResponse(body: any, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  // Get OpenAI API key from environment variable
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) {
    return corsError('OpenAI API key not found in environment variables')
  }

  try {
    const { companyName } = await req.json()

    if (!companyName) {
      console.error("Company name is required")
      return corsError("Firmenname ist erforderlich")
    }

    console.log(`Received request for company: ${companyName}`)

    // Schnelle lokale Validierung - typische Fehler abfangen
    // Wenn kein richtiger Name, sondern nur URL oder Domäne übergeben wurde
    if (
      companyName.includes("www.") ||
      companyName.includes("http") ||
      companyName.includes(".de") ||
      companyName.includes(".com")
    ) {
      console.error("Invalid company name format")
      return corsError(
        "Bitte geben Sie einen gültigen Firmennamen ein, keine URL oder Domain."
      );
    }

    // Prompt for OpenAI to analyze the company
    const prompt = `
    Als Business-Analyst, analysiere dieses Unternehmen: "${companyName}".
    Liefere die folgenden Informationen im JSON-Format zurück:

    1. companyName: Der korrekte Name des Unternehmens.
    2. productsServices: Die wichtigsten Produkte oder Dienstleistungen des Unternehmens.
    3. targetAudience: Die Zielgruppe des Unternehmens.
    4. usp: Die Unique Selling Proposition / Alleinstellungsmerkmale des Unternehmens.
    5. businessDescription: Eine kurze Beschreibung des Unternehmens.

    WICHTIG: Basiere deine Analyse auf öffentlich verfügbaren Informationen. Falls du keine gesicherten Informationen hast, mache vernünftige Annahmen basierend auf der Branche. 
    Antworte NUR mit einem validen JSON-Objekt, ohne zusätzlichen Text oder Markierungen.
    `;

    console.log("Sending request to OpenAI API");
    
    try {
      // Direct API call to OpenAI using fetch
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API error response:", errorData);
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("OpenAI API raw response:", data);

      if (!data.choices || data.choices.length === 0) {
        console.error("No choices in OpenAI response");
        throw new Error("OpenAI returned an empty response");
      }

      const aiResponse = data.choices[0]?.message?.content || '';
      console.log("AI content response:", aiResponse);

      // Try to parse the entire response as JSON first
      let companyInfo;
      try {
        // Versuchen, die gesamte Antwort als JSON zu parsen
        companyInfo = JSON.parse(aiResponse);
        console.log("Successfully parsed entire response as JSON");
      } catch (parseError) {
        console.error("Error parsing response as direct JSON:", parseError);
        
        // Als Fallback: Versuchen, JSON aus dem Text zu extrahieren
        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonText = jsonMatch[0];
            companyInfo = JSON.parse(jsonText);
            console.log("Successfully extracted and parsed JSON from text");
          } else {
            throw new Error("No JSON object found in response");
          }
        } catch (extractError) {
          console.error("Error extracting JSON from text:", extractError);
          throw new Error("Could not parse response as JSON");
        }
      }

      // Final validation
      if (!companyInfo || typeof companyInfo !== 'object') {
        throw new Error("Invalid company information format");
      }

      return corsResponse(companyInfo);
    } catch (error) {
      console.error("Error calling API:", error.message);
      return corsError(`Error analyzing company: ${error.message}`);
    }
  } catch (error) {
    console.error("Function error:", error.message);
    return corsError(`Function error: ${error.message}`);
  }
})
