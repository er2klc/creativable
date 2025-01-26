import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { SocialMediaStats } from "../../_shared/social-media-utils.ts";

export async function scanInstagramProfile(username: string, leadId: string): Promise<SocialMediaStats> {
  console.log('Starting Instagram profile scan for:', { username, leadId });
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Apify API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('apify_api_key')
      .single();

    if (settingsError || !settings?.apify_api_key) {
      console.error('Error getting Apify API key:', settingsError);
      throw new Error('Could not retrieve Apify API key');
    }

    const apiKey = settings.apify_api_key;
    const profileUrl = `https://www.instagram.com/${username}/`;
    console.log('Instagram profile URL:', profileUrl);

    // Start Apify scraping run
    const runResponse = await fetch('https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startUrls: [{ url: profileUrl }]
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

        // Update lead with Instagram data
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            name: profileData.fullName || username,
            social_media_bio: profileData.biography,
            social_media_followers: parseInt(profileData.followersCount) || 0,
            social_media_following: parseInt(profileData.followsCount) || 0,
            social_media_profile_image_url: profileData.profilePicUrlHD || profileData.profilePicUrl,
            last_social_media_scan: new Date().toISOString()
          })
          .eq('id', leadId);

        if (updateError) {
          console.error('Error updating lead:', updateError);
          throw updateError;
        }

        return {
          bio: profileData.biography || null,
          connections: profileData.followersCount || null,
          headline: profileData.fullName || null,
          isPrivate: false
        };
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Timeout waiting for Instagram profile data');
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    throw error;
  }
}
