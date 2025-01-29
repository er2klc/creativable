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
    const { error: initialScanError } = await supabase
      .from('social_media_scan_history')
      .insert({
        lead_id: leadId,
        platform: 'linkedin',
        processing_progress: 0,
        current_file: 'Verbindung zu LinkedIn wird hergestellt... 🔗',
        success: false
      });

    if (initialScanError) {
      console.error('Error creating initial scan history:', initialScanError);
      throw initialScanError;
    }

    // Start the Apify run
    console.log('Starting Apify actor run for profile:', username);
    await updateScanProgress(supabase, leadId, 10, 'Profil wird aufgerufen... 🔍');

    const runResponse = await fetch(
      'https://api.apify.com/v2/acts/scrap3r~LinkedIn-people-profiles-by-url/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apify_api_key}`,
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
    console.log('Apify run response:', JSON.stringify(runData, null, 2));
    
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

      // Calculate progress based on status and attempts
      let progress = 30;
      let statusMessage = 'Daten werden analysiert... 📊';
      
      if (status.data?.status === 'RUNNING') {
        if (attempts < 5) {
          progress = 30;
          statusMessage = 'Verbindung zu LinkedIn wird hergestellt... 🔗';
        } else if (attempts < 10) {
          progress = 45;
          statusMessage = 'Profildaten werden geladen... 👤';
        } else if (attempts < 15) {
          progress = 60;
          statusMessage = 'Berufserfahrung wird ausgewertet... 💼';
        } else if (attempts < 20) {
          progress = 75;
          statusMessage = 'Bildungsinformationen werden verarbeitet... 🎓';
        } else {
          progress = 90;
          statusMessage = 'Daten werden gespeichert... 💾';
        }
      } else if (status.data?.status === 'SUCCEEDED') {
        progress = 100;
        statusMessage = 'Scan erfolgreich abgeschlossen! ✅';
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
        console.log('Received LinkedIn profile data:', JSON.stringify(items, null, 2));
        
        if (items && Array.isArray(items) && items.length > 0) {
          profileData = items[0];
          console.log('Processing profile data:', JSON.stringify(profileData, null, 2));
          break;
        }
      } else if (status.data?.status === 'FAILED' || status.data?.status === 'ABORTED') {
        const logsResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}/logs?token=${settings.apify_api_key}`
        );
        const logsText = await logsResponse.text();
        console.error('Actor logs:', logsText);

        throw new Error(
          `Actor run failed: ${
            status.data?.errorMessage || 'Unknown error'
          }. Logs: ${logsText}`
        );
      }

      await new Promise(resolve => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    if (!profileData) {
      throw new Error('No profile data returned after maximum polling attempts');
    }

    console.log('Successfully retrieved profile data');

    // Process the LinkedIn data
    const { leadUpdate, experiencePosts, educationPosts } = await processLinkedInData(profileData, leadId);
    console.log('Processed LinkedIn data:', {
      leadUpdate,
      experiencePosts,
      educationPosts
    });

    // Update the lead with LinkedIn data
    const { error: updateLeadError } = await supabase
      .from('leads')
      .update({
        ...leadUpdate,
        platform: 'LinkedIn',
        last_social_media_scan: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateLeadError) throw updateLeadError;

    // Insert LinkedIn posts (experience and education)
    if (Array.isArray(experiencePosts) && experiencePosts.length > 0 || 
        Array.isArray(educationPosts) && educationPosts.length > 0) {
      const postsWithLeadId = [...(experiencePosts || []), ...(educationPosts || [])].map(post => ({
        ...post,
        lead_id: leadId
      }));

      if (postsWithLeadId.length > 0) {
        const { error: postsError } = await supabase
          .from('linkedin_posts')
          .upsert(postsWithLeadId, {
            onConflict: 'id'
          });

        if (postsError) {
          console.error('Error storing LinkedIn posts:', postsError);
        }
      }
    }

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