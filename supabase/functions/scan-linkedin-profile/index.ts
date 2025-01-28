import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabase } from "../_shared/supabase.ts";
import { processLinkedInData } from "../_shared/linkedin/data-processor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_POLLING_ATTEMPTS = 30;

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
    const { error: scanHistoryError } = await supabase
      .from('social_media_scan_history')
      .insert({
        lead_id: leadId,
        platform: 'linkedin',
        processing_progress: 0,
        current_file: 'Initializing scan...',
      });

    if (scanHistoryError) throw scanHistoryError;

    // Start the Apify run
    console.log('Starting Apify actor run for profile:', username);
    const runResponse = await fetch(
      'https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apify_api_key}`,
        },
        body: JSON.stringify({
          // Make sure we only scan the requested profile
          url: [`https://www.linkedin.com/in/${username}/`]
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

    // Update progress to 10% after successful start
    await supabase
      .from('social_media_scan_history')
      .update({
        processing_progress: 10,
        current_file: 'Scanning LinkedIn profile...'
      })
      .eq('lead_id', leadId)
      .eq('platform', 'linkedin');

    let attempts = 0;
    let profileData = null;

    while (attempts < MAX_POLLING_ATTEMPTS) {
      console.log(`Polling attempt ${attempts + 1}/${MAX_POLLING_ATTEMPTS}`);
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${settings.apify_api_key}`
      );

      if (!statusResponse.ok) {
        console.error('Failed to check run status:', await statusResponse.text());
        continue;
      }

      const status = await statusResponse.json();
      console.log('Run status:', status.data?.status);

      // Update progress based on status
      const progress = Math.min(90, 10 + (attempts * (80 / MAX_POLLING_ATTEMPTS)));
      await supabase
        .from('social_media_scan_history')
        .update({
          processing_progress: progress,
          current_file: `Scanning profile (${status.data?.status})`
        })
        .eq('lead_id', leadId)
        .eq('platform', 'linkedin');

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
        const errorMessage = status.data?.errorMessage || 'Unknown error';
        console.error('Actor run failed:', errorMessage);
        
        await supabase
          .from('social_media_scan_history')
          .update({
            error_message: errorMessage,
            success: false
          })
          .eq('lead_id', leadId)
          .eq('platform', 'linkedin');
          
        throw new Error(`Actor run failed: ${errorMessage}`);
      }

      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      attempts++;
    }

    if (!profileData) {
      throw new Error('No profile data returned after maximum polling attempts');
    }

    console.log('Successfully retrieved profile data:', profileData);

    // Process the data
    const { scanHistory, leadData } = processLinkedInData(profileData);

    // Update scan history with final data
    await supabase
      .from('social_media_scan_history')
      .update({
        ...scanHistory,
        processing_progress: 100,
        current_file: 'Completed',
        success: true
      })
      .eq('lead_id', leadId)
      .eq('platform', 'linkedin');

    // Update lead with profile data
    await supabase
      .from('leads')
      .update(leadData)
      .eq('id', leadId);

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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});