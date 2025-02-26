
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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

    const { companyName } = await req.json()

    if (!companyName) {
      throw new Error('Company name is required')
    }

    console.log('Fetching company info for:', {
      companyName,
      timestamp: new Date().toISOString()
    })

    // OpenAI API Key überprüfen
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          details: 'Please configure OpenAI API key in Supabase settings'
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

    // OpenAI API aufrufen für Firmenanalyse
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Du bist ein Business Analyst. Analysiere das Unternehmen "${companyName}" und erstelle eine strukturierte Analyse mit folgenden Aspekten:
              - Produkte und Dienstleistungen
              - Zielgruppe
              - Alleinstellungsmerkmal (USP)
              - Geschäftsbeschreibung`
          }
        ],
        temperature: 0.7
      })
    })

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text())
      throw new Error('Failed to analyze company info')
    }

    const openAIData = await openAIResponse.json()
    const analysis = openAIData.choices[0].message.content

    // Analysieren und strukturieren der OpenAI-Antwort
    const lines = analysis.split('\n')
    let section = ''
    const result = {
      companyName,
      productsServices: '',
      targetAudience: '',
      usp: '',
      businessDescription: ''
    }

    for (const line of lines) {
      if (line.includes('Produkte und Dienstleistungen')) {
        section = 'productsServices'
      } else if (line.includes('Zielgruppe')) {
        section = 'targetAudience'
      } else if (line.includes('Alleinstellungsmerkmal') || line.includes('USP')) {
        section = 'usp'
      } else if (line.includes('Geschäftsbeschreibung')) {
        section = 'businessDescription'
      } else if (line.trim() && section) {
        result[section] += (result[section] ? '\n' : '') + line.trim()
      }
    }

    console.log('Successfully generated company info:', {
      company: companyName,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in fetch-company-info:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch and analyze company information'
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
