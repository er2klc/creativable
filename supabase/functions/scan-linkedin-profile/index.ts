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

    // Validate input
    if (!username || !leadId) {
      throw new Error('Username and Lead ID are required')
    }

    // Get full LinkedIn URL from username
    const profileUrl = linkedInApi.validateProfileUrl(username)
    console.log('Validated LinkedIn URL:', profileUrl)

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

    console.log('Raw LinkedIn profile data:', JSON.stringify(profileData, null, 2))

    // Process and store profile data
    const scanHistoryData = {
      lead_id: leadId,
      platform: 'LinkedIn',
      followers_count: profileData.followers || 0,
      following_count: profileData.connections || 0,
      posts_count: profileData.activity?.length || 0,
      profile_data: {
        headline: profileData.position,
        summary: profileData.about,
        location: profileData.location,
        industry: profileData.current_company?.name || '',
      },
      experience: profileData.experience || [],
      education: profileData.education || [],
      skills: [],
      certifications: [],
      languages: [],
      recommendations: [],
      success: true,
      scanned_at: new Date().toISOString()
    }

    console.log('Processed scan history data:', JSON.stringify(scanHistoryData, null, 2))

    const { error: scanError } = await supabaseClient
      .from('social_media_scan_history')
      .insert(scanHistoryData)

    if (scanError) {
      console.error('Error storing scan history:', scanError)
      throw scanError
    }

    console.log('Successfully stored scan history')

    // Update lead with LinkedIn data
    const leadUpdateData = {
      linkedin_id: profileData.linkedin_id,
      current_company_name: profileData.current_company?.name,
      experience: profileData.experience || [],
      social_media_followers: profileData.followers || 0,
      social_media_bio: profileData.about,
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