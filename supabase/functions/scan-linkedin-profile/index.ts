import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { linkedInApi } from "../_shared/linkedin.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { username, leadId } = await req.json()
    console.log('Starting LinkedIn scan for:', username, 'Lead ID:', leadId)

    if (!username || !leadId) {
      throw new Error('Username and Lead ID are required')
    }

    const profileUrl = linkedInApi.validateProfileUrl(username)
    console.log('Validated LinkedIn URL:', profileUrl)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialize scan progress
    await updateScanProgress(supabaseClient, leadId, 5, "Initializing LinkedIn scan...")

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

    // Update progress - Fetching API key
    await updateScanProgress(supabaseClient, leadId, 15, "Fetching API credentials...")

    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings')
    }

    // Update progress - Starting Apify scan
    await updateScanProgress(supabaseClient, leadId, 25, "Connecting to LinkedIn profile...")

    console.log('Starting Apify scan for LinkedIn profile:', profileUrl)

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

    // Update progress - Scanning profile
    await updateScanProgress(supabaseClient, leadId, 35, "Scanning LinkedIn profile...")

    let attempts = 0
    const maxAttempts = 30
    let profileData = null

    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1}/${maxAttempts})`)

      // Update progress during polling (35-75%)
      const pollProgress = 35 + Math.floor((attempts / maxAttempts) * 40)
      await updateScanProgress(supabaseClient, leadId, pollProgress, "Retrieving profile data...")

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

    // Update progress - Processing data
    await updateScanProgress(supabaseClient, leadId, 80, "Processing profile information...")

    console.log('Raw LinkedIn profile data:', JSON.stringify(profileData, null, 2))

    // Store scan history
    const scanHistoryData = {
      lead_id: leadId,
      platform: 'LinkedIn',
      followers_count: profileData.followers || 0,
      following_count: profileData.connections || 0,
      posts_count: profileData.activity?.length || 0,
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
      success: true,
      scanned_at: new Date().toISOString()
    }

    // Update progress - Saving scan history
    await updateScanProgress(supabaseClient, leadId, 85, "Saving scan history...")

    const { error: scanError } = await supabaseClient
      .from('social_media_scan_history')
      .insert(scanHistoryData)

    if (scanError) {
      console.error('Error storing scan history:', scanError)
      throw scanError
    }

    // Update progress - Processing posts
    await updateScanProgress(supabaseClient, leadId, 90, "Processing LinkedIn posts...")

    // Store LinkedIn posts
    if (profileData.activity && profileData.activity.length > 0) {
      const postsToInsert = profileData.activity.map((post: any) => ({
        id: post.id || `${leadId}-${Math.random().toString(36).substr(2, 9)}`,
        lead_id: leadId,
        content: post.text || '',
        url: post.url || null,
        media_urls: post.images || [],
        post_type: 'activity',
        reactions: post.statistics || {},
        metadata: post,
        posted_at: post.date ? new Date(post.date).toISOString() : new Date().toISOString()
      }))

      const { error: postsError } = await supabaseClient
        .from('linkedin_posts')
        .upsert(postsToInsert, {
          onConflict: 'id'
        })

      if (postsError) {
        console.error('Error storing LinkedIn posts:', postsError)
      }
    }

    // Update progress - Saving lead data
    await updateScanProgress(supabaseClient, leadId, 95, "Updating contact information...")

    // Update lead with LinkedIn data
    const leadUpdateData = {
      linkedin_id: profileData.profileId || profileData.linkedinId || null,
      name: profileData.fullName || profileData.name, // Use actual name from LinkedIn
      social_media_username: username, // Keep the original username
      platform: 'LinkedIn',
      social_media_bio: profileData.summary || profileData.about,
      social_media_profile_image_url: profileData.profileImage || profileData.avatar,
      current_company_name: profileData.currentCompany?.name || profileData.experience?.[0]?.companyName,
      position: profileData.currentCompany?.title || profileData.experience?.[0]?.title,
      city: profileData.location,
      social_media_followers: profileData.followers || 0,
      social_media_following: profileData.connections || 0,
      social_media_verified: false,
      experience: profileData.experience || [],
      last_social_media_scan: new Date().toISOString()
    }

    console.log('Updating lead with data:', JSON.stringify(leadUpdateData, null, 2))

    const { error: leadUpdateError } = await supabaseClient
      .from('leads')
      .update(leadUpdateData)
      .eq('id', leadId)

    if (leadUpdateError) {
      console.error('Error updating lead:', leadUpdateError)
      throw leadUpdateError
    }

    // Update progress - Completed
    await updateScanProgress(supabaseClient, leadId, 100, "Profile scan completed!")

    console.log('Successfully updated lead')

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

async function updateScanProgress(
  supabaseClient: any,
  leadId: string,
  progress: number,
  message: string
) {
  console.log(`Updating scan progress: ${progress}% - ${message}`);
  
  await supabaseClient
    .from('social_media_posts')
    .upsert({ 
      id: `temp-${leadId}`,
      lead_id: leadId,
      platform: 'LinkedIn',
      post_type: 'post',
      processing_progress: progress,
      current_file: message,
      media_processing_status: progress === 100 ? 'completed' : 'processing'
    });
}