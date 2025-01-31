import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { getSupabase } from '../_shared/supabase.ts'
import { processMediaFiles } from '../_shared/instagram/media-processor.ts'
import { ProcessingState } from '../_shared/types/instagram.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { username, leadId, platform = 'instagram' } = await req.json()

    if (!username || !leadId) {
      throw new Error('Username and leadId are required')
    }

    const supabase = getSupabase()
    
    // Get the API key from settings
    const { data: settings } = await supabase
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    if (!settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings')
    }

    console.log('Starting Instagram profile scan for:', username)

    const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${settings.apify_api_key}`
    
    const response = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "usernames": [username],
        "resultsLimit": 50,
        "resultsType": "posts",
        "extendOutputFunction": "($) => { return { timestamp: new Date().toISOString() } }",
        "proxy": { "useApifyProxy": true }
      })
    })

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid response from Apify')
    }

    const profile = data[0]
    if (!profile) {
      throw new Error('No profile data found')
    }

    const posts = profile.latestPosts.map(post => ({
      id: post.id,
      type: post.type,
      caption: post.caption,
      url: post.url,
      timestamp: post.timestamp,
      media_urls: post.imageUrls || [],
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      likes: post.likesCount,
      comments: post.commentsCount
    }))

    // Beim ersten Speichern der Posts
    const postsToInsert = posts.map(post => ({
      ...post,
      lead_id: leadId,
      platform: platform.toLowerCase(),
      media_count: post.media_urls ? Math.min(post.media_urls.length, 10) : 0
    }))

    const { error: postsError } = await supabase
      .from('social_media_posts')
      .upsert(postsToInsert, { onConflict: 'id' })

    if (postsError) {
      throw new Error(`Error inserting posts: ${postsError.message}`)
    }

    // Update lead profile data
    const { error: leadError } = await supabase
      .from('leads')
      .update({
        social_media_bio: profile.bio,
        social_media_followers: profile.followersCount,
        social_media_following: profile.followingCount,
        social_media_posts_count: profile.postsCount,
        social_media_profile_image_url: profile.profilePicUrl,
        last_social_media_scan: new Date().toISOString()
      })
      .eq('id', leadId)

    if (leadError) {
      throw new Error(`Error updating lead: ${leadError.message}`)
    }

    // Track scan history
    const { error: historyError } = await supabase
      .from('social_media_scan_history')
      .insert({
        lead_id: leadId,
        platform: platform.toLowerCase(),
        scanned_at: new Date().toISOString(),
        followers_count: profile.followersCount,
        following_count: profile.followingCount,
        posts_count: profile.postsCount,
        success: true,
        profile_data: profile
      })

    if (historyError) {
      throw new Error(`Error inserting scan history: ${historyError.message}`)
    }

    // Start media processing
    const updateProgress = async (state: ProcessingState) => {
      const { error } = await supabase
        .from('social_media_posts')
        .update({
          processing_progress: (state.processedFiles / state.totalFiles) * 100,
          current_file: state.currentFile,
          error_message: state.error
        })
        .eq('lead_id', leadId)

      if (error) {
        console.error('Error updating progress:', error)
      }
    }

    // Process media files in background
    processMediaFiles(postsToInsert, leadId, supabase, updateProgress)
      .catch(error => console.error('Error processing media files:', error))

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Profile scan completed successfully',
        data: {
          postsCount: posts.length,
          followersCount: profile.followersCount,
          followingCount: profile.followingCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in scan-social-profile:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})