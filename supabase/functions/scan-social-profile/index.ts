import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ApifyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platform, username, leadId } = await req.json()
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Apify API key from secrets
    const { data: secrets, error: secretError } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', 'APIFY_API_TOKEN')
      .single()

    if (secretError || !secrets?.value) {
      throw new Error('Could not retrieve Apify API key')
    }

    const apiKey = secrets.value
    const BASE_URL = 'https://api.apify.com/v2'

    // Start the scraping run
    const runResponse = await fetch(`${BASE_URL}/acts/apify~instagram-profile-scraper/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usernames: [username]
      })
    })

    if (!runResponse.ok) {
      throw new Error(`HTTP error! status: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    // Poll for results
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      const datasetResponse = await fetch(`${BASE_URL}/actor-runs/${runId}/dataset/items`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!datasetResponse.ok) {
        throw new Error(`HTTP error! status: ${datasetResponse.status}`)
      }

      const items = await datasetResponse.json()
      
      if (items.length > 0) {
        const profileData = items[0]

        // Update lead with social media data
        const { error: updateError } = await supabaseClient
          .from('leads')
          .update({
            social_media_bio: profileData.bio,
            social_media_followers: profileData.followersCount,
            social_media_following: profileData.followingCount,
            social_media_engagement_rate: profileData.engagementRate,
            social_media_profile_image_url: profileData.profilePicUrl,
            social_media_posts: profileData.latestPosts,
            last_social_media_scan: new Date().toISOString()
          })
          .eq('id', leadId)

        if (updateError) {
          throw updateError
        }

        // Add scan history entry
        const { error: historyError } = await supabaseClient
          .from('instagram_scan_history')
          .insert({
            lead_id: leadId,
            followers_count: profileData.followersCount,
            following_count: profileData.followingCount,
            posts_count: profileData.postsCount,
            engagement_rate: profileData.engagementRate,
            success: true
          })

        if (historyError) {
          throw historyError
        }

        return new Response(
          JSON.stringify({ success: true, data: profileData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    throw new Error('Timeout waiting for results')
  } catch (error) {
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