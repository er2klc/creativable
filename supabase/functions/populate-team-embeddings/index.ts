import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processTeamData, processPersonalData, initOpenAI, initSupabase } from "../_shared/embedding-utils.ts"

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
    const { userId, teamId } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Initialize clients
    const supabase = initSupabase()
    
    // Get OpenAI API key from settings
    const { data: settings } = await supabase
      .from('settings')
      .select('openai_api_key')
      .eq('user_id', userId)
      .single()

    if (!settings?.openai_api_key) {
      throw new Error('OpenAI API key not found in settings')
    }

    const openai = initOpenAI(settings.openai_api_key)

    // Process personal data
    await processPersonalData(userId, supabase, openai)

    // If teamId is provided, process team data
    if (teamId) {
      await processTeamData(teamId, supabase, openai)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in populate-team-embeddings:', error)
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