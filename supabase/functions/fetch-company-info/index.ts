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
      throw new Error('Firmenname ist erforderlich');
    }

    console.log('Hole Informationen für Firma:', companyName);

    // During registration, use the default key
    let openAIApiKey = null;
    if (isRegistration) {
      openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      console.log('Verwende Standard OpenAI Key für Registrierung');
    } else if (userId) {
      // For all other operations, try to get user's OpenAI API key
      const supabase = getSupabase();
      const { data: settings } = await supabase
        .from('settings')
        .select('openai_api_key')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (settings?.openai_api_key) {
        openAIApiKey = settings.openai_api_key;
        console.log('Verwende Benutzer OpenAI Key');
      }
    }

    if (!openAIApiKey) {
      throw new Error('Kein OpenAI API-Schlüssel verfügbar');
    }

    const systemPrompt = `Du bist ein Experte für Network Marketing und MLM-Unternehmen.
Deine Aufgabe ist es, präzise und professionelle Informationen über MLM-Unternehmen zu liefern.
Fokussiere dich auf:
- Die Stärken und USPs des Unternehmens
- Die Qualität der Produkte und Dienstleistungen
- Die Marktchancen und das Wachstumspotenzial
- Die Zielgruppe und deren Bedürfnisse
Wenn spezifische Details unsicher sind, liefere allgemeine, positive Informationen die typisch für erfolgreiche MLM-Unternehmen sind.
Halte die Antworten kurz, prägnant und professionell.`;

    const userPrompt = `Bitte analysiere das Network Marketing Unternehmen "${companyName}" und stelle die folgenden spezifischen Informationen bereit:

1. Offizieller Firmenname (kurz und präzise)
2. Hauptprodukte oder -dienstleistungen (maximal 2 Sätze)
3. Zielgruppe (wer sind die idealen Kunden, maximal 1 Satz)
4. Alleinstellungsmerkmal/USP (was macht sie besonders, maximal 1 Satz)
5. Geschäftsbeschreibung (2-3 Sätze über ihr Geschäftsmodell und ihren Ansatz)

Formatiere deine Antwort als JSON-Objekt mit genau diesen Schlüsseln:
{
  "companyName": "string (kurz und präzise)",
  "productsServices": "string (maximal 2 Sätze)",
  "targetAudience": "string (maximal 1 Satz)",
  "usp": "string (maximal 1 Satz)",
  "businessDescription": "string (2-3 Sätze)"
}`;

    console.log('Sende Anfrage an OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API Fehler:', await response.text());
      throw new Error('Fehler beim Abrufen der Firmeninformationen von OpenAI');
    }

    const data = await response.json();
    console.log('OpenAI Antwort:', data);

    const content = data.choices[0].message.content;
    console.log('Inhalt von OpenAI:', content);

    let companyInfo;
    try {
      companyInfo = JSON.parse(content);
    } catch (e) {
      console.log('Direktes JSON-Parsing fehlgeschlagen, versuche JSON aus Inhalt zu extrahieren');
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        companyInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Konnte Firmeninformationen nicht aus OpenAI-Antwort extrahieren');
      }
    }

    // Validiere, dass alle erforderlichen Felder vorhanden sind
    const requiredFields = ['companyName', 'productsServices', 'targetAudience', 'usp', 'businessDescription'];
    for (const field of requiredFields) {
      if (!companyInfo[field]) {
        companyInfo[field] = `Informationen zu ${field} nicht verfügbar`;
      }
    }

    // Stelle sicher, dass die Antworten nicht zu lang sind
    const maxLengths = {
      companyName: 100,
      productsServices: 200,
      targetAudience: 150,
      usp: 150,
      businessDescription: 300
    };

    for (const [field, maxLength] of Object.entries(maxLengths)) {
      if (companyInfo[field] && companyInfo[field].length > maxLength) {
        companyInfo[field] = companyInfo[field].substring(0, maxLength) + '...';
      }
    }

    console.log('Verarbeitete und validierte Firmeninfo:', companyInfo);

    return new Response(JSON.stringify(companyInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fehler in fetch-company-info Funktion:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Wenn dieser Fehler weiterhin besteht, versuchen Sie es erneut oder kontaktieren Sie den Support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});