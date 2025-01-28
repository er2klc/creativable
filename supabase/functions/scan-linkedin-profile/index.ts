import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    console.log('Starting LinkedIn scan for username:', username);
    
    const profileUrl = `https://www.linkedin.com/in/${username}`;
    console.log('Profile URL:', profileUrl);

    // Make the API call to Apify
    const apifyResponse = await fetch(
      'https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer apify_api_f1kz2Rx2gh5v3b2daml7qOhejAOsZG3aSUMg`
        },
        body: JSON.stringify({
          "url": [profileUrl]
        })
      }
    );

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Failed to start Apify actor:', errorText);
      throw new Error(`Failed to start Apify actor: ${errorText}`);
    }

    const runData = await apifyResponse.json();
    console.log('Apify actor run started:', runData);

    if (!runData.data?.id) {
      throw new Error('No run ID returned from Apify');
    }

    // Wait for the run to complete
    const maxAttempts = 30;
    let attempts = 0;
    let profileData = null;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const runStatusResponse = await fetch(
        `https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs/${runData.data.id}?token=apify_api_f1kz2Rx2gh5v3b2daml7qOhejAOsZG3aSUMg`
      );

      if (!runStatusResponse.ok) {
        console.error('Failed to check run status:', await runStatusResponse.text());
        continue;
      }

      const runStatus = await runStatusResponse.json();
      console.log('Run status:', runStatus.data?.status);

      if (runStatus.data?.status === 'SUCCEEDED') {
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs/${runData.data.id}/dataset/items?token=apify_api_f1kz2Rx2gh5v3b2daml7qOhejAOsZG3aSUMg`
        );

        if (!datasetResponse.ok) {
          throw new Error(`Failed to fetch dataset: ${await datasetResponse.text()}`);
        }

        const items = await datasetResponse.json();
        if (items && items.length > 0) {
          profileData = items[0];
          break;
        }
      } else if (runStatus.data?.status === 'FAILED' || runStatus.data?.status === 'ABORTED') {
        const errorMessage = runStatus.data?.errorMessage || 'Unknown error';
        console.error('Actor run failed:', errorMessage);
        throw new Error(`Actor run failed: ${errorMessage}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!profileData) {
      throw new Error('No profile data returned from Apify after maximum attempts');
    }

    console.log('Successfully retrieved profile data:', profileData);

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