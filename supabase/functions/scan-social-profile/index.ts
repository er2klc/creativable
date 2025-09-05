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

    // Get Apify API key from user settings
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { data: userSettings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !userSettings?.apify_api_key) {
      throw new Error('Apify API key not found in user settings');
    }

    // Create initial progress record - use a proper UUID
    const progressId = crypto.randomUUID();
    const { error: insertError } = await supabaseClient
      .from('social_media_posts')
      .insert({
        id: progressId,
        lead_id: leadId,
        user_id: user.id,
        platform: platform,
        post_type: 'profile_scan',
        processing_progress: 0,
        current_file: 'Starting profile scan...'
      });

    if (insertError) {
      console.error('Failed to create progress record:', insertError);
    }

    // Update progress to 20%
    await updateProgress(supabaseClient, leadId, 'Connecting to Instagram API...', 20);

    // Start Apify scraping run
    const runResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userSettings.apify_api_key}`,
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
          'Authorization': `Bearer ${userSettings.apify_api_key}`
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
  
  // Update all progress records for this lead
  await supabaseClient
    .from('social_media_posts')
    .update({ 
      processing_progress: progress,
      current_file: message
    })
    .eq('lead_id', leadId)
    .eq('post_type', 'profile_scan');
}