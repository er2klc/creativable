import { SocialMediaStats } from "../_shared/social-media-utils.ts";

export async function scanInstagramProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning Instagram profile for:', username);
  
  try {
    // Get Apify API key from secrets
    const { data: secrets, error: secretError } = await supabase
      .from('secrets')
      .select('*')
      .eq('name', 'APIFY_API_TOKEN')
      .single();

    if (secretError || !secrets?.value) {
      console.error("Error fetching Apify API key:", secretError);
      return {};
    }

    const apiKey = secrets.value;
    const actorId = 'apify/instagram-profile-scraper';

    // Start the Apify actor run
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startUrls: [{
          url: `https://www.instagram.com/${username}/`
        }],
        resultsLimit: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const runData = await response.json();
    const runId = runData.data.id;

    // Wait for the run to finish and get results
    let attempts = 0;
    const maxAttempts = 30;
    const delayMs = 2000;

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      const runInfo = await statusResponse.json();
      
      if (runInfo.data.status === 'SUCCEEDED') {
        // Get the results
        const resultsResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          }
        );
        
        const results = await resultsResponse.json();
        
        if (results && results.length > 0) {
          const profile = results[0];
          console.log('Apify scan results:', profile);
          
          return {
            bio: profile.bio || profile.description || '',
            followers: profile.followersCount || profile.followers || 0,
            following: profile.followingCount || profile.following || 0,
            posts: profile.postsCount || profile.posts || 0,
            isPrivate: profile.isPrivate || false,
            profileImageUrl: profile.profilePicUrl || profile.profileImageUrl || '',
            engagement_rate: profile.engagement_rate || null
          };
        }
      }

      if (runInfo.data.status === 'FAILED' || runInfo.data.status === 'ABORTED') {
        throw new Error(`Run ${runId} ${runInfo.data.status}`);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempts++;
    }

    throw new Error('Timeout waiting for results');
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {};
  }
}