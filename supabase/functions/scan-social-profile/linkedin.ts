import { SocialMediaStats } from "../_shared/social-media-utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export async function scanLinkedInProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning LinkedIn profile for:', username);
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Apify API key from secrets
    const { data: secrets, error: secretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'APIFY_API_TOKEN')
      .maybeSingle();

    if (secretError || !secrets?.value) {
      console.error('Error fetching Apify API key:', secretError);
      throw new Error('Could not retrieve Apify API key');
    }

    const apiKey = secrets.value;
    console.log('Starting Apify scraping run for LinkedIn profile');

    // Start the Apify actor for LinkedIn scraping using the correct actor
    const runResponse = await fetch('https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "startUrls": [{
          "url": `https://www.linkedin.com/in/${username}`
        }],
        "maxItems": 1,
        "scrapeConnectionsDegree": false
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
        console.log('LinkedIn profile data received:', profileData);

        // Extract relevant information
        return {
          bio: profileData.summary || profileData.description || null,
          connections: profileData.connectionsCount || null,
          headline: profileData.headline || null,
          isPrivate: false // LinkedIn API doesn't provide this information
        };
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Timeout waiting for LinkedIn profile data');
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    throw error;
  }
}