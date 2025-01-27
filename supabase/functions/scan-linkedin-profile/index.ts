import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { linkedInApi } from "../_shared/linkedin.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { profileUrl, leadId } = await req.json()

    // Validate input
    if (!profileUrl || !leadId) {
      throw new Error('Profile URL and Lead ID are required')
    }

    // Validate LinkedIn URL format
    const profileId = linkedInApi.validateProfileUrl(profileUrl)
    if (!profileId) {
      throw new Error('Invalid LinkedIn profile URL')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    // Get user's Apify API key from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings')
    }

    console.log('Starting Apify scan for LinkedIn profile:', profileUrl)

    // Start Apify actor
    const startResponse = await fetch(
      `https://api.apify.com/v2/actor-tasks/creativable~linkedin-people-profiles/runs?token=${settings.apify_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrls: [{ url: profileUrl }],
          maxRequestRetries: 3,
          maxConcurrency: 1,
          maxItems: 1,
        }),
      }
    )

    if (!startResponse.ok) {
      const errorText = await startResponse.text()
      console.error('Failed to start Apify actor:', errorText)
      throw new Error('Failed to start LinkedIn profile scan')
    }

    const runData = await startResponse.json()
    const runId = runData.data.id

    // Poll for results
    let attempts = 0
    const maxAttempts = 30
    let profileData = null

    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1}/${maxAttempts})`)

      const datasetResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${settings.apify_api_key}`
      )

      if (!datasetResponse.ok) {
        console.error('Failed to fetch dataset:', await datasetResponse.text())
        throw new Error('Failed to fetch scan results')
      }

      const items = await datasetResponse.json()
      
      if (items.length > 0) {
        profileData = items[0]
        break
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    if (!profileData) {
      throw new Error('Timeout waiting for profile data')
    }

    console.log('Successfully retrieved LinkedIn profile data')

    // Process and store profile data
    const { error: scanError } = await supabaseClient
      .from('linkedin_scan_history')
      .insert({
        lead_id: leadId,
        followers_count: profileData.followersCount || 0,
        connections_count: profileData.connectionsCount || 0,
        posts_count: profileData.postsCount || 0,
        profile_data: {
          headline: profileData.headline,
          summary: profileData.summary,
          location: profileData.location,
          industry: profileData.industry,
        },
        experience: profileData.experience || [],
        education: profileData.education || [],
        skills: profileData.skills || [],
        certifications: profileData.certifications || [],
        languages: profileData.languages || [],
        recommendations: profileData.recommendations || [],
        success: true
      })

    if (scanError) {
      console.error('Error storing scan history:', scanError)
      throw scanError
    }

    // Process and store posts if available
    if (profileData.posts && profileData.posts.length > 0) {
      const postsToInsert = profileData.posts.map((post: any) => ({
        id: post.id,
        lead_id: leadId,
        content: post.text,
        post_type: post.type || 'post',
        likes_count: post.likeCount || 0,
        comments_count: post.commentCount || 0,
        shares_count: post.shareCount || 0,
        url: post.url,
        posted_at: post.postedAt,
        media_urls: post.mediaUrls || [],
        media_type: post.mediaType,
        reactions: post.reactions || {},
        metadata: {
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          originalLanguage: post.language,
        }
      }))

      const { error: postsError } = await supabaseClient
        .from('linkedin_posts')
        .upsert(postsToInsert, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (postsError) {
        console.error('Error storing posts:', postsError)
      }
    }

    // Update lead with LinkedIn data
    const { error: leadUpdateError } = await supabaseClient
      .from('leads')
      .update({
        linkedin_id: profileData.profileId,
        current_company_name: profileData.currentCompany,
        experience: profileData.experience || [],
        social_media_followers: profileData.followersCount || 0,
        social_media_bio: profileData.summary,
        last_social_media_scan: new Date().toISOString()
      })
      .eq('id', leadId)

    if (leadUpdateError) {
      console.error('Error updating lead:', leadUpdateError)
      throw leadUpdateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'LinkedIn profile scanned successfully',
        data: profileData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to scan LinkedIn profile' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})