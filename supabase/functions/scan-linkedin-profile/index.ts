import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabase } from "../_shared/supabase.ts";
import { processLinkedInData } from "../_shared/linkedin/data-processor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, leadId } = await req.json();
    console.log('Starting LinkedIn profile scan for username:', username);

    if (!username || !leadId) {
      throw new Error('Username and leadId are required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Invalid authorization token');

    // Get user's Apify API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings');
    }

    // Create initial scan history record
    await updateScanProgress(supabase, leadId, 0, 'Verbindung zu LinkedIn wird hergestellt... 🔗');

    // Start the Apify run
    console.log('Starting Apify actor run for profile:', username);
    await updateScanProgress(supabase, leadId, 10, 'Profil wird aufgerufen... 🔍');

    const runResponse = await fetch(
      'https://api.apify.com/v2/acts/apimaestro~linkedin-profile-detail/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apify_api_key}`,
        },
        body: JSON.stringify({
          username: username
        })
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Failed to start Apify actor:', errorText);
      throw new Error(`Failed to start Apify actor: ${errorText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data?.id;
    
    if (!runId) throw new Error('No run ID returned from Apify');
    console.log('Apify run started with ID:', runId);

    await updateScanProgress(supabase, leadId, 30, 'Daten werden analysiert... 📊');

    // Poll for results
    const maxAttempts = 30;
    const pollingInterval = 5000;
    let attempts = 0;
    let profileData = null;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${settings.apify_api_key}`
      );

      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }

      const status = await statusResponse.json();
      console.log('Run status:', status.data?.status);

      // Calculate progress based on status
      let progress = 30;
      let statusMessage = 'Daten werden analysiert... 📊';
      
      if (status.data?.status === 'RUNNING') {
        if (attempts < 5) {
          progress = 30;
          statusMessage = 'Daten werden analysiert... 📊';
        } else if (attempts < 10) {
          progress = 50;
          statusMessage = 'Bildungsinformationen werden verarbeitet... 🎓';
        } else if (attempts < 15) {
          progress = 70;
          statusMessage = 'Berufserfahrung wird ausgewertet... 💼';
        } else {
          progress = 90;
          statusMessage = 'Daten werden gespeichert... 💾';
        }
      } else if (status.data?.status === 'SUCCEEDED') {
        progress = 90;
        statusMessage = 'Daten werden gespeichert... 💾';
      }

      await updateScanProgress(supabase, leadId, progress, statusMessage);

      if (status.data?.status === 'SUCCEEDED') {
        const datasetId = status.data?.defaultDatasetId;
        if (!datasetId) throw new Error('No dataset ID found in successful run');

        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${datasetId}/items?token=${settings.apify_api_key}`
        );

        if (!datasetResponse.ok) {
          throw new Error(`Failed to fetch dataset: ${await datasetResponse.text()}`);
        }

        const items = await datasetResponse.json();
        if (items && items.length > 0) {
          profileData = items[0];
          break;
        }
      } else if (status.data?.status === 'FAILED' || status.data?.status === 'ABORTED') {
        throw new Error(`Actor run failed: ${status.data?.errorMessage || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    if (!profileData) {
      throw new Error('No profile data returned after maximum polling attempts');
    }

    console.log('Successfully retrieved profile data');

    // Process the LinkedIn data
    const { scanHistory, leadData } = processLinkedInData(profileData);

    // Update the lead with LinkedIn data
    const { error: updateLeadError } = await supabase
      .from('leads')
      .update({
        ...leadData,
        platform: 'LinkedIn',
        last_social_media_scan: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateLeadError) throw updateLeadError;

    // Update scan history with final success status
    await updateScanProgress(supabase, leadId, 100, 'Scan erfolgreich abgeschlossen! ✅', true);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: profileData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    
    // Update scan history with error
    if (error instanceof Error) {
      const supabase = getSupabase();
      await supabase
        .from('social_media_scan_history')
        .update({
          success: false,
          error_message: error.message,
          processing_progress: 100,
          current_file: `Fehler beim Scan: ${error.message} ❌`
        })
        .eq('platform', 'linkedin');
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

async function updateScanProgress(
  supabase: any,
  leadId: string,
  progress: number,
  statusMessage: string,
  success: boolean = false
) {
  const { error } = await supabase
    .from('social_media_scan_history')
    .update({
      processing_progress: progress,
      current_file: statusMessage,
      success: success,
      scanned_at: success ? new Date().toISOString() : null
    })
    .eq('lead_id', leadId)
    .eq('platform', 'linkedin');

  if (error) {
    console.error('Error updating scan progress:', error);
  }
}