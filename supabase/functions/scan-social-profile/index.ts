import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { processInstagramProfile } from '../_shared/instagram/profile-processor.ts'
import { processMediaFiles } from '../_shared/instagram/media-processor.ts'
import { InstagramProfile, ProcessingState } from '../_shared/types/instagram.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { platform, username, leadId } = await req.json()
    
    console.log('Starting scan for profile:', {
      platform,
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create initial progress record with 0%
    await supabaseClient
      .from('social_media_posts')
      .upsert({
        id: `temp-${leadId}`,
        lead_id: leadId,
        platform: platform,
        post_type: 'post',
        processing_progress: 0,
        media_processing_status: 'processing',
        current_file: 'Starting profile scan...'
      })

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

    console.log('Starting Apify scraping run');

    // Update progress to 10% - Starting Apify run
    await updateProgress(supabaseClient, leadId, {
      totalFiles: 0,
      processedFiles: 0,
      currentFile: 'Starting profile scan...'
    }, 10);

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

    console.log('Apify run started:', { runId });

    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1}/${maxAttempts})`);

      const currentProgress = Math.min(90, 20 + Math.floor((attempts / maxAttempts) * 70));
      
      await updateProgress(supabaseClient, leadId, {
        totalFiles: 0,
        processedFiles: 0,
        currentFile: 'Scanning profile data...'
      }, currentProgress);

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
        const profileData = items[0] as InstagramProfile;
        console.log('Profile data received:', profileData);

        // Process profile data (Phase 1)
        await processInstagramProfile(profileData, leadId, supabaseClient);

        // Start Phase 2 - Media Processing
        if (profileData.latestPosts && profileData.latestPosts.length > 0) {
          const posts = profileData.latestPosts.map(post => ({
            id: post.id,
            lead_id: leadId,
            platform: 'Instagram',
            post_type: normalizePostType(post.type),
            content: post.caption,
            likes_count: parseInt(post.likesCount as string) || 0,
            comments_count: parseInt(post.commentsCount as string) || 0,
            url: post.url,
            location: post.locationName,
            mentioned_profiles: post.mentions || [],
            tagged_profiles: post.taggedUsers?.map(u => u.username) || [],
            posted_at: post.timestamp,
            metadata: {
              hashtags: post.hashtags || [],
              media_urls: getMediaUrls(post),
              videoUrl: post.videoUrl,
              musicInfo: post.musicInfo,
              alt: post.alt,
            },
            media_urls: getMediaUrls(post),
            media_type: post.videoUrl ? 'video' : 'image',
            engagement_count: (parseInt(post.likesCount as string) || 0) + (parseInt(post.commentsCount as string) || 0),
            video_url: post.videoUrl,
            hashtags: post.hashtags || []
          }));

          const { data: savedPosts, error: postsError } = await supabaseClient
            .from('social_media_posts')
            .upsert(posts, {
              onConflict: 'id',
              ignoreDuplicates: false
            })
            .select();

          if (postsError) {
            throw postsError;
          }

          console.log(`Successfully stored ${posts.length} posts, starting media processing`);

          // Process media files (Phase 2)
          await processMediaFiles(
            savedPosts,
            leadId,
            supabaseClient,
            async (state: ProcessingState) => {
              const progress = Math.round((state.processedFiles / state.totalFiles) * 100);
              await updateProgress(supabaseClient, leadId, state, progress);
            }
          );
        } else {
          // No posts to process, complete immediately
          await updateProgress(supabaseClient, leadId, {
            totalFiles: 0,
            processedFiles: 0,
            currentFile: 'No media files to process'
          }, 100);
        }

        await supabaseClient
          .from('social_media_scan_history')
          .insert({
            lead_id: leadId,
            platform: platform,
            followers_count: parseInt(profileData.followersCount as string) || 0,
            following_count: parseInt(profileData.followsCount as string) || 0,
            posts_count: profileData.latestPosts?.length || 0,
            success: true,
            profile_data: profileData
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Profile scan completed successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    throw new Error('Maximum polling attempts reached');
  } catch (error) {
    console.error('Error during scan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during scanning'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function updateProgress(
  supabaseClient: ReturnType<typeof createClient>,
  leadId: string,
  state: ProcessingState,
  progress: number
): Promise<void> {
  await supabaseClient
    .from('social_media_posts')
    .update({ 
      processing_progress: progress,
      current_file: state.currentFile,
      error_message: state.error,
      media_processing_status: progress === 100 ? 'completed' : 'processing'
    })
    .eq('id', `temp-${leadId}`);
}

function normalizePostType(type: string): 'post' | 'video' | 'reel' | 'story' | 'igtv' {
  if (!type) return 'post';
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'video':
    case 'reel':
    case 'story':
    case 'igtv':
      return normalizedType;
    default:
      return 'post';
  }
}

function getMediaUrls(post: any): string[] {
  if (post.type === 'Video' || post.videoUrl) {
    return post.videoUrl ? [post.videoUrl] : [];
  } else if (post.type === 'Sidecar' && post.images) {
    return post.images;
  } else {
    return [post.displayUrl || (post.images && post.images[0])].filter(Boolean);
  }
}