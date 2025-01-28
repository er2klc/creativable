import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APIFY_TOKEN = 'apify_api_f1kz2Rx2gh5v3b2daml7qOhejAOsZG3aSUMg';
const MAX_POLLING_ATTEMPTS = 30;
const POLLING_INTERVAL = 5000; // 5 seconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    console.log('Starting LinkedIn profile scan for username:', username);

    if (!username) {
      throw new Error('Username is required');
    }

    // Step 1: Start the Apify run
    console.log('Starting Apify actor run...');
    const runResponse = await fetch(
      'https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APIFY_TOKEN}`,
        },
        body: JSON.stringify({
          url: [`https://www.linkedin.com/in/${username}`]
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
    
    if (!runId) {
      throw new Error('No run ID returned from Apify');
    }
    console.log('Apify run started with ID:', runId);

    // Step 2: Poll for completion
    let attempts = 0;
    let profileData = null;

    while (attempts < MAX_POLLING_ATTEMPTS) {
      console.log(`Polling attempt ${attempts + 1}/${MAX_POLLING_ATTEMPTS}`);
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      );

      if (!statusResponse.ok) {
        console.error('Failed to check run status:', await statusResponse.text());
        continue;
      }

      const status = await statusResponse.json();
      console.log('Run status:', status.data?.status);

      if (status.data?.status === 'SUCCEEDED') {
        // Get the dataset ID
        const datasetId = status.data?.defaultDatasetId;
        if (!datasetId) {
          throw new Error('No dataset ID found in successful run');
        }

        // Fetch the results
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
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
        throw new Error(`Actor run failed: ${errorMessage}`);
      }

      // Wait before next polling attempt
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      attempts++;
    }

    if (!profileData) {
      throw new Error('No profile data returned from Apify after maximum attempts');
    }

    console.log('Successfully retrieved profile data');

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