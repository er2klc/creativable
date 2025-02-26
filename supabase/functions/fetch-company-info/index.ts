import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { companyName, userId, isRegistration } = await req.json()

    console.log('Fetching company info for:', {
      companyName,
      userId,
      isRegistration,
      timestamp: new Date().toISOString()
    })

    if (!companyName || !userId) {
      throw new Error('Missing required parameters')
    }

    // Get user's language preference
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('language')
      .eq('user_id', userId)
      .single()

    const language = settings?.language || 'de'
    const systemPrompt = language === 'en' 
      ? "You are a helpful business analyst. Analyze the company and provide key business insights."
      : "Du bist ein hilfreicher Business Analyst. Analysiere das Unternehmen und liefere wichtige geschäftliche Erkenntnisse."

    // Simulate company info analysis
    const companyInfo = {
      companyName,
      productsServices: language === 'en' 
        ? "Products and services analysis based on company profile"
        : "Produkt- und Dienstleistungsanalyse basierend auf Unternehmensprofil",
      targetAudience: language === 'en'
        ? "Target audience analysis"
        : "Zielgruppenanalyse",
      usp: language === 'en'
        ? "Unique selling proposition analysis"
        : "Alleinstellungsmerkmal-Analyse",
      businessDescription: language === 'en'
        ? "Detailed business description and analysis"
        : "Detaillierte Geschäftsbeschreibung und Analyse"
    }

    console.log('Successfully generated company info:', {
      company: companyName,
      userId,
      timestamp: new Date().toISOString()
    })

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
    console.error('Error in fetch-company-info:', error)
    
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