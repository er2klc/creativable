import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ScanProfileRequest {
  username: string;
  platform: string;
  leadId?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username, platform } = await req.json() as ScanProfileRequest;
    console.log('Processing request:', { username, platform });

    if (!username) {
      throw new Error('Username is required');
    }

    // Get Apify API key from secrets
    const apiKey = Deno.env.get('APIFY_API_TOKEN');
    if (!apiKey) {
      throw new Error('APIFY_API_TOKEN is not configured');
    }

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
          
          return new Response(
            JSON.stringify({
              bio: profile.bio || profile.description || '',
              followers: profile.followersCount || profile.followers || 0,
              following: profile.followingCount || profile.following || 0,
              posts: profile.postsCount || profile.posts || 0,
              engagement_rate: profile.engagement_rate || null,
              profileImageUrl: profile.profilePicUrl || profile.profileImageUrl || '',
              name: profile.name || profile.fullName || username
            }),
            {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
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
    console.error('Error in scan-social-profile:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});