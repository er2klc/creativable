import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { processInstagramProfile } from "../_shared/instagram/profile-processor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, username, leadId } = await req.json();
    
    console.log('Starting profile scan:', {
      platform,
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create initial progress record
    await supabaseClient
      .from('social_media_posts')
      .upsert({
        id: `temp-${leadId}`,
        lead_id: leadId,
        platform: platform,
        post_type: 'post',
        processing_progress: 0,
        current_file: 'Starting profile scan...'
      });

    // Get Apify API key
    const { data: secrets, error: secretError } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', 'APIFY_API_TOKEN')
      .single();

    if (secretError || !secrets?.value) {
      throw new Error('Could not retrieve Apify API key');
    }

    // Update progress to 20%
    await updateProgress(supabaseClient, leadId, 'Connecting to Instagram API...', 20);

    // Start Apify scraping run
    const runResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secrets.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usernames: [username]
      })
    });

    if (!runResponse.ok) {
      throw new Error(`HTTP error! status: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log('Apify run started:', { runId });

    // Poll for results
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1}/${maxAttempts})`);
      
      const progress = Math.min(80, 20 + Math.floor((attempts / maxAttempts) * 60));
      await updateProgress(supabaseClient, leadId, 'Scanning Instagram profile...', progress);

      const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`, {
        headers: {
          'Authorization': `Bearer ${secrets.value}`
        }
      });

      if (!datasetResponse.ok) {
        throw new Error(`HTTP error! status: ${datasetResponse.status}`);
      }

      const items = await datasetResponse.json();
      
      if (items.length > 0) {
        const profileData = items[0];
        console.log('Profile data received');

        await updateProgress(supabaseClient, leadId, 'Processing profile data...', 90);
        
        // Process profile data
        await processInstagramProfile(profileData, leadId, supabaseClient);
        
        // Mark as complete
        await updateProgress(supabaseClient, leadId, 'Profile scan completed', 100);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Profile scan completed successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Maximum polling attempts reached');
  } catch (error) {
    console.error('Error during scan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during scanning'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function updateProgress(
  supabaseClient: ReturnType<typeof createClient>,
  leadId: string,
  message: string,
  progress: number
): Promise<void> {
  console.log(`Updating progress: ${progress}% - ${message}`);
  
  await supabaseClient
    .from('social_media_posts')
    .update({ 
      processing_progress: progress,
      current_file: message,
      media_processing_status: progress === 100 ? 'completed' : 'processing'
    })
    .eq('id', `temp-${leadId}`);
}