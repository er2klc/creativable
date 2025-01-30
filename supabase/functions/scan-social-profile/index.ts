import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { processMediaFiles } from '../_shared/instagram/media-processor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { leadId, platform, username } = await req.json()
    console.log('Processing social profile:', { leadId, platform, username })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the raw data from the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('social_media_raw_data')  // Updated from social_media_posts
      .eq('id', leadId)
      .single()

    if (leadError) {
      throw leadError
    }

    if (!lead.social_media_raw_data) {  // Updated from social_media_posts
      throw new Error('No social media data found')
    }

    // Process the posts from raw data
    const posts = Array.isArray(lead.social_media_raw_data) ? lead.social_media_raw_data : []  // Updated from social_media_posts

    console.log(`Found ${posts.length} posts to process`)

    // Insert posts into social_media_posts table
    for (const post of posts) {
      const { error: insertError } = await supabase
        .from('social_media_posts')
        .insert({
          lead_id: leadId,
          platform: platform.toLowerCase(),
          post_type: post.type || 'post',
          content: post.caption || post.content,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          url: post.url,
          location: post.location,
          mentioned_profiles: post.mentioned_profiles,
          tagged_profiles: post.tagged_profiles,
          posted_at: post.timestamp || post.posted_at,
          media_urls: post.media_urls || [post.displayUrl],
          media_type: post.type?.toLowerCase(),
          hashtags: post.hashtags,
          processing_progress: 0,
          current_file: null
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting post:', insertError)
        continue
      }
    }

    // Process media files
    await processMediaFiles(posts, leadId, supabase, async (state) => {
      const { error } = await supabase
        .from('social_media_scan_history')
        .update({
          processing_progress: state.progress,
          current_file: state.currentFile,
          error_message: state.error
        })
        .eq('lead_id', leadId)
      
      if (error) console.error('Error updating scan history:', error)
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing social profile:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})