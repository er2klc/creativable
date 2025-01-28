import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { scanLinkedInProfile } from "../_shared/linkedin/profile-scanner.ts"
import { ProgressTracker } from "../_shared/linkedin/progress-tracker.ts"
import { processLinkedInData } from "../_shared/linkedin/data-processor.ts"
import { saveLinkedInData } from "../_shared/linkedin/db-operations.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { username, leadId } = await req.json()
    console.log('Starting LinkedIn scan for:', username, 'Lead ID:', leadId)

    if (!username || !leadId) {
      throw new Error('Username and Lead ID are required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const progress = new ProgressTracker(supabaseClient, leadId);

    // Initialize scan - 5%
    await progress.updateProgress(5, "Initializing LinkedIn scan...");

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    // Fetch API key - 15%
    await progress.updateProgress(15, "Fetching API credentials...");

    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings')
    }

    // Start scan - 25%
    await progress.updateProgress(25, "Connecting to LinkedIn profile...");

    // Scan profile - 35%
    await progress.updateProgress(35, "Scanning LinkedIn profile...");
    
    const profileData = await scanLinkedInProfile({
      username,
      leadId,
      apifyApiKey: settings.apify_api_key
    });

    // Process data - 80%
    await progress.updateProgress(80, "Processing profile information...");
    
    const { scanHistory, leadData } = processLinkedInData(profileData);
    scanHistory.lead_id = leadId;

    // Save data - 90%
    await progress.updateProgress(90, "Saving profile data...");
    
    await saveLinkedInData(
      supabaseClient,
      leadId,
      scanHistory,
      leadData,
      profileData.activity || []
    );

    // Complete - 100%
    await progress.updateProgress(100, "Profile scan completed!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'LinkedIn profile scanned successfully',
        data: profileData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to scan LinkedIn profile' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})