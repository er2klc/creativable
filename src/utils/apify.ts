import { supabase } from "@/integrations/supabase/client";

interface ApifyResponse {
  name?: string;
  username: string;
  followers: number;
  following: number;
  posts: number;
  bio?: string;
  profileImageUrl?: string;
}

const APIFY_ACTORS = {
  Instagram: 'apify/instagram-profile-scraper',
  LinkedIn: 'apify/linkedin-profile-scraper',
  Facebook: 'apify/facebook-profile-scraper',
  TikTok: 'apify/tiktok-profile-scraper'
};

export const scanSocialProfile = async (platform: string, username: string): Promise<ApifyResponse | null> => {
  try {
    // Get Apify API key from secrets
    const { data: secrets, error: secretError } = await supabase
      .from('secrets')
      .select('*')
      .eq('name', 'APIFY_API_TOKEN')
      .single();

    if (secretError || !secrets?.value) {
      console.error("Error fetching Apify API key:", secretError);
      return null;
    }

    const apiKey = secrets.value;
    const actorId = APIFY_ACTORS[platform as keyof typeof APIFY_ACTORS];

    if (!actorId) {
      console.error(`No Apify actor found for platform: ${platform}`);
      return null;
    }

    // Make the actual API call to Apify
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startUrls: [{
          url: platform === 'Instagram' ? `https://www.instagram.com/${username}/` :
                platform === 'LinkedIn' ? `https://www.linkedin.com/in/${username}/` :
                platform === 'Facebook' ? `https://www.facebook.com/${username}/` :
                `https://www.tiktok.com/@${username}/`
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
    const results = await waitForResults(apiKey, runId);
    if (!results || results.length === 0) {
      throw new Error('No results found');
    }

    // Map the platform-specific response to our common format
    const profileData = results[0];
    return {
      name: profileData.name || profileData.fullName || profileData.displayName || username,
      username: username,
      followers: profileData.followersCount || profileData.followers || 0,
      following: profileData.followingCount || profileData.following || 0,
      posts: profileData.postsCount || profileData.posts || 0,
      bio: profileData.bio || profileData.description || '',
      profileImageUrl: profileData.profilePicUrl || profileData.profileImageUrl || profileData.avatarUrl
    };

  } catch (error) {
    console.error("Error scanning social profile:", error);
    return null;
  }
};

const waitForResults = async (apiKey: string, runId: string): Promise<any> => {
  const maxAttempts = 30;
  const delayMs = 2000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const runInfo = await response.json();
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
      return await resultsResponse.json();
    }

    if (runInfo.data.status === 'FAILED' || runInfo.data.status === 'ABORTED') {
      throw new Error(`Run ${runId} ${runInfo.data.status}`);
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
    attempts++;
  }

  throw new Error('Timeout waiting for results');
};