import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { scanLinkedInProfile } from './linkedin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { platform, username, leadId } = await req.json()
    
    console.log('Starting scan for profile:', {
      platform,
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let profileData;
    
    if (platform === 'LinkedIn') {
      profileData = await scanLinkedInProfile(username);
      
      if (profileData) {
        const { error: updateError } = await supabaseClient
          .from('leads')
          .update({
            name: username,
            social_media_bio: profileData.bio,
            social_media_stats: {
              connections: profileData.connections,
              headline: profileData.headline
            },
            last_social_media_scan: new Date().toISOString()
          })
          .eq('id', leadId);

        if (updateError) {
          console.error('Error updating lead:', updateError);
          throw updateError;
        }
      }
    } else {
      // Check if platform is Instagram
      if (platform === 'Instagram') {
        const { data: { secrets }, error: secretError } = await supabaseClient
          .from('secrets')
          .select('value')
          .eq('name', 'APIFY_API_TOKEN')
          .single();

        if (secretError || !secrets?.value) {
          console.error('Error fetching Apify API key:', secretError);
          throw new Error('Could not retrieve Apify API key');
        }

        const apiKey = secrets.value;
        console.log('Starting Apify scraping run for Instagram profile');

        // Start the Apify actor for Instagram scraping
        const runResponse = await fetch('https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usernames: [username]
          })
        });

        if (!runResponse.ok) {
          console.error('Error starting Apify run:', await runResponse.text());
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
          
          const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          });

          if (!datasetResponse.ok) {
            console.error('Error fetching dataset:', await datasetResponse.text());
            throw new Error(`HTTP error! status: ${datasetResponse.status}`);
          }

          const items = await datasetResponse.json();
          
          if (items.length > 0) {
            const profileData = items[0];
            console.log('Instagram profile data received:', profileData);

            // Extract relevant information
            const { error: updateError } = await supabaseClient
              .from('leads')
              .update({
                name: profileData.username,
                social_media_bio: profileData.bio,
                social_media_followers: parseInt(profileData.followersCount) || 0,
                social_media_following: parseInt(profileData.followingCount) || 0,
                last_social_media_scan: new Date().toISOString()
              })
              .eq('id', leadId);

            if (updateError) {
              console.error('Error updating lead:', updateError);
              throw updateError;
            }

            return new Response(
              JSON.stringify({ success: true, data: profileData }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }

        throw new Error('Timeout waiting for Instagram profile data');
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: profileData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error during scan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during scanning'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
