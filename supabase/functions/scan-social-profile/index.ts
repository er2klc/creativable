import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platform, username, leadId } = await req.json()
    
    console.log('Starting scan for profile:', {
      platform,
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

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
      console.error('Error getting Apify API key:', secretError);
      throw new Error('Could not retrieve Apify API key')
    }

    const apiKey = secrets.value
    const BASE_URL = 'https://api.apify.com/v2'

    console.log('Starting Apify scraping run');

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
      console.error('Error starting Apify run:', await runResponse.text());
      throw new Error(`HTTP error! status: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    console.log('Apify run started:', { runId });

    // Poll for results
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1}/${maxAttempts})`);

      const datasetResponse = await fetch(`${BASE_URL}/actor-runs/${runId}/dataset/items`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!datasetResponse.ok) {
        console.error('Error fetching dataset:', await datasetResponse.text());
        throw new Error(`HTTP error! status: ${datasetResponse.status}`)
      }

      const items = await datasetResponse.json()
      
      if (items.length > 0) {
        const profileData = items[0]
        console.log('Profile data received:', profileData);

        // Calculate engagement rate
        const engagementRate = profileData.followersCount > 0 
          ? ((profileData.latestPosts?.reduce((sum: number, post: any) => 
              sum + (post.likesCount || 0) + (post.commentsCount || 0), 0) / 
              (profileData.latestPosts?.length || 1)) / profileData.followersCount)
          : 0;

        // Extract hashtags from posts
        const hashtags = new Set<string>();
        profileData.latestPosts?.forEach((post: any) => {
          post.hashtags?.forEach((tag: string) => hashtags.add(tag));
        });

        // Update lead with social media data
        const { error: updateError } = await supabaseClient
          .from('leads')
          .update({
            name: profileData.fullName || profileData.username,
            social_media_bio: profileData.biography,
            social_media_followers: profileData.followersCount,
            social_media_following: profileData.followsCount,
            social_media_engagement_rate: engagementRate,
            social_media_profile_image_url: profileData.profilePicUrlHD || profileData.profilePicUrl,
            social_media_posts: profileData.latestPosts,
            social_media_verified: profileData.verified,
            social_media_categories: profileData.businessCategoryName ? [profileData.businessCategoryName] : null,
            social_media_interests: Array.from(hashtags),
            last_social_media_scan: new Date().toISOString()
          })
          .eq('id', leadId)

        if (updateError) {
          console.error('Error updating lead:', updateError);
          throw updateError
        }

        // Add scan history entry
        const { error: historyError } = await supabaseClient
          .from('instagram_scan_history')
          .insert({
            lead_id: leadId,
            followers_count: profileData.followersCount,
            following_count: profileData.followsCount,
            posts_count: profileData.postsCount,
            engagement_rate: engagementRate,
            success: true
          })

        if (historyError) {
          console.error('Error creating scan history:', historyError);
          throw historyError
        }

        // Store posts with detailed metadata
        if (profileData.latestPosts?.length > 0) {
          const posts = profileData.latestPosts.map((post: any) => ({
            lead_id: leadId,
            platform: 'Instagram',
            post_type: post.type,
            content: post.caption,
            likes_count: post.likesCount,
            comments_count: post.commentsCount,
            url: post.url,
            location: post.locationName,
            mentioned_profiles: post.mentions,
            tagged_profiles: post.taggedUsers?.map((u: any) => u.username) || [],
            posted_at: post.timestamp,
            metadata: {
              hashtags: post.hashtags,
              images: post.images,
              videoUrl: post.videoUrl,
              musicInfo: post.musicInfo,
              alt: post.alt,
              childPosts: post.childPosts
            }
          }))

          const { error: postsError } = await supabaseClient
            .from('social_media_posts')
            .upsert(posts, { 
              onConflict: 'lead_id,url',
              ignoreDuplicates: true 
            })

          if (postsError) {
            console.error('Error storing posts:', postsError);
            // Log error but don't throw to still return success for profile scan
          }
        }

        console.log('Scan completed successfully');

        return new Response(
          JSON.stringify({ success: true, data: profileData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    console.error('Timeout waiting for results');
    throw new Error('Timeout waiting for results')
  } catch (error) {
    console.error('Error during scan:', error);
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