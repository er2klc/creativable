import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Create initial progress record
    const { error: initialProgressError } = await supabaseClient
      .from('social_media_posts')
      .upsert({
        id: `temp-${leadId}`,
        lead_id: leadId,
        platform: platform,
        post_type: 'post',
        processing_progress: 0
      })

    if (initialProgressError) {
      console.error('Error setting initial progress:', initialProgressError)
    }

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

    // Update progress to 10% - Starting Apify run
    const { error: progress10Error } = await supabaseClient
      .from('social_media_posts')
      .update({ processing_progress: 10 })
      .eq('id', `temp-${leadId}`)

    if (progress10Error) {
      console.error('Error updating progress to 10%:', progress10Error);
    }

    const apifyRequest = {
      url: `${BASE_URL}/acts/apify~instagram-profile-scraper/runs`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usernames: [username]
      })
    };
    console.log('Apify request:', JSON.stringify(apifyRequest, null, 2));

    const runResponse = await fetch(apifyRequest.url, {
      method: apifyRequest.method,
      headers: apifyRequest.headers,
      body: apifyRequest.body
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Error starting Apify run:', {
        status: runResponse.status,
        statusText: runResponse.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${runResponse.status}, body: ${errorText}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    console.log('Apify run started:', { runId });

    // Update progress to 20% - Apify run started
    const { error: progress20Error } = await supabaseClient
      .from('social_media_posts')
      .update({ processing_progress: 20 })
      .eq('id', `temp-${leadId}`)

    if (progress20Error) {
      console.error('Error updating progress to 20%:', progress20Error);
    }

    let attempts = 0
    const maxAttempts = 60 // Increased from 30 to 60 for longer processing time
    let lastProgressUpdate = Date.now()
    const progressTimeout = 60000 // Increased from 30s to 60s timeout
    let mediaProcessingStarted = false
    
    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1}/${maxAttempts})`);

      // Calculate and update progress based on attempts (20% to 90%)
      const progressRange = 70; // from 20% to 90%
      const currentProgress = Math.min(90, 20 + Math.floor((attempts / maxAttempts) * progressRange));
      
      console.log(`Updating processing progress to ${currentProgress}%`);
      const { error: progressError } = await supabaseClient
        .from('social_media_posts')
        .update({ 
          processing_progress: currentProgress,
          error_message: null // Clear any previous error messages
        })
        .eq('id', `temp-${leadId}`);

      if (progressError) {
        console.error(`Error updating progress to ${currentProgress}%:`, progressError);
      }

      const datasetResponse = await fetch(`${BASE_URL}/actor-runs/${runId}/dataset/items`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!datasetResponse.ok) {
        const errorText = await datasetResponse.text();
        console.error('Error fetching dataset:', {
          status: datasetResponse.status,
          statusText: datasetResponse.statusText,
          body: errorText
        });

        // Check for timeout
        if (Date.now() - lastProgressUpdate > progressTimeout) {
          const timeoutError = 'Progress update timeout - no response from Apify';
          console.error(timeoutError);
          
          // Update database with error message
          await supabaseClient
            .from('social_media_posts')
            .update({ 
              error_message: timeoutError,
              processing_progress: currentProgress
            })
            .eq('id', `temp-${leadId}`);
            
          // Don't throw error, continue to Phase 2
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: timeoutError,
              shouldContinue: true // Signal to continue to Phase 2
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 // Return 200 to allow continuation
            }
          );
        }

        throw new Error(`HTTP error! status: ${datasetResponse.status}, body: ${errorText}`)
      }

      const items = await datasetResponse.json()
      
      if (items.length > 0) {
        const profileData = items[0]
        console.log('Profile data received:', profileData);
        lastProgressUpdate = Date.now()

        // Process profile image first
        const newProfileImageUrl = await downloadAndUploadImage(
          profileData.profilePicUrlHD || profileData.profilePicUrl,
          supabaseClient,
          leadId
        );

        const allHashtags = new Set<string>();
        profileData.latestPosts?.forEach((post: any) => {
          const hashtags = post.hashtags || [];
          hashtags.forEach((tag: string) => allHashtags.add(tag));
        });

        const engagementRate = profileData.followersCount > 0 
          ? ((profileData.latestPosts?.reduce((sum: number, post: any) => 
              sum + (parseInt(post.likesCount) || 0) + (parseInt(post.commentsCount) || 0), 0) / 
              (profileData.latestPosts?.length || 1)) / profileData.followersCount)
          : 0;

        const { error: updateError } = await supabaseClient
          .from('leads')
          .update({
            name: profileData.fullName || profileData.username,
            social_media_bio: profileData.biography,
            social_media_followers: parseInt(profileData.followersCount) || 0,
            social_media_following: parseInt(profileData.followsCount) || 0,
            social_media_engagement_rate: engagementRate,
            social_media_profile_image_url: newProfileImageUrl,
            social_media_posts: profileData.latestPosts,
            social_media_verified: profileData.verified,
            social_media_categories: profileData.businessCategoryName ? [profileData.businessCategoryName] : null,
            social_media_interests: Array.from(allHashtags),
            last_social_media_scan: new Date().toISOString()
          })
          .eq('id', leadId)

        if (updateError) {
          console.error('Error updating lead:', updateError);
          throw updateError
        }

        const posts = profileData.latestPosts?.map((post: any) => {
          let mediaUrls = [];
          let videoUrl = null;
          
          if (post.type === 'Video' || post.videoUrl) {
            videoUrl = post.videoUrl;
            mediaUrls = videoUrl ? [videoUrl] : [];
          } else if (post.type === 'Sidecar' && post.images) {
            mediaUrls = post.images;
          } else {
            mediaUrls = [post.displayUrl || (post.images && post.images[0])].filter(Boolean);
          }

          console.log('Processing post media:', {
            postId: post.id,
            mediaUrls,
            videoUrl,
            type: post.type
          });

          return {
            id: post.id,
            lead_id: leadId,
            platform: 'Instagram',
            post_type: normalizePostType(post.type),
            content: post.caption,
            likes_count: parseInt(post.likesCount) || 0,
            comments_count: parseInt(post.commentsCount) || 0,
            url: post.url,
            location: post.locationName,
            mentioned_profiles: post.mentions || [],
            tagged_profiles: post.taggedUsers?.map((u: any) => u.username) || [],
            posted_at: post.timestamp,
            metadata: {
              hashtags: post.hashtags || [],
              media_urls: mediaUrls,
              videoUrl: videoUrl,
              musicInfo: post.musicInfo,
              alt: post.alt,
            },
            media_urls: mediaUrls,
            media_type: videoUrl ? 'video' : 'image',
            engagement_count: (parseInt(post.likesCount) || 0) + (parseInt(post.commentsCount) || 0),
            first_comment: post.firstComment,
            video_url: videoUrl,
            hashtags: post.hashtags || []
          };
        }) || [];

        if (posts.length > 0) {
          const { data: savedPosts, error: postsError } = await supabaseClient
            .from('social_media_posts')
            .upsert(posts, {
              onConflict: 'id',
              ignoreDuplicates: false
            })
            .select();

          if (postsError) {
            console.error('Error storing posts:', postsError);
          } else {
            console.log(`Successfully stored ${posts.length} posts`);
            mediaProcessingStarted = true;

            // Start Phase 2 - Media Processing
            let processedFiles = 0;
            const totalFiles = savedPosts.reduce((sum, post) => 
              sum + (post.media_urls?.length || 0), 0);

            // Update progress for Phase 2 start
            await supabaseClient
              .from('social_media_posts')
              .update({ 
                processing_progress: 0,
                media_processing_status: 'processing',
                error_message: null
              })
              .eq('id', `temp-${leadId}`);

            // Process media files
            for (const post of savedPosts) {
              if (!post.media_urls || post.media_urls.length === 0) {
                console.log('No media URLs to process for post:', post.id);
                continue;
              }

              for (const mediaUrl of post.media_urls) {
                try {
                  console.log('Processing media:', {
                    mediaUrl,
                    leadId: post.lead_id,
                    postId: post.id,
                    mediaType: post.media_type
                  });

                  const response = await supabaseClient.functions.invoke('process-social-media', {
                    body: {
                      mediaUrl,
                      leadId: post.lead_id,
                      mediaType: post.media_type,
                      postId: post.id,
                      platform: 'Instagram'
                    }
                  });

                  processedFiles++;
                  const mediaProgress = Math.round((processedFiles / totalFiles) * 100);
                  
                  // Update progress for Phase 2
                  await supabaseClient
                    .from('social_media_posts')
                    .update({ 
                      processing_progress: mediaProgress,
                      current_file: mediaUrl,
                      error_message: null
                    })
                    .eq('id', `temp-${leadId}`);

                  console.log('Media processing response:', response);
                } catch (error) {
                  console.error('Error processing media for post:', {
                    postId: post.id,
                    mediaUrl,
                    error
                  });
                }
              }
            }

            // Final update for Phase 2
            await supabaseClient
              .from('social_media_posts')
              .update({ 
                processing_progress: 100,
                media_processing_status: 'completed',
                error_message: null
              })
              .eq('id', `temp-${leadId}`);
          }
        } else {
          // No posts to process, complete Phase 2 immediately
          await supabaseClient
            .from('social_media_posts')
            .update({ 
              processing_progress: 100,
              media_processing_status: 'completed',
              error_message: 'No media files found'
            })
            .eq('id', `temp-${leadId}`);
        }

        const { error: scanHistoryError } = await supabaseClient
          .from('social_media_scan_history')
          .insert({
            lead_id: leadId,
            platform: platform,
            followers_count: parseInt(profileData.followersCount) || 0,
            following_count: parseInt(profileData.followsCount) || 0,
            posts_count: profileData.latestPosts?.length || 0,
            engagement_rate: engagementRate,
            success: true,
            profile_data: profileData
          })

        if (scanHistoryError) {
          console.error('Error storing scan history:', scanHistoryError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: profileData,
            mediaProcessingStarted,
            totalFiles: posts.reduce((sum, post) => sum + (post.media_urls?.length || 0), 0)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
      lastProgressUpdate = Date.now()
    }

    const timeoutError = 'Maximum polling attempts reached';
    console.error(timeoutError);
    
    // Update database with timeout error but allow continuation
    await supabaseClient
      .from('social_media_posts')
      .update({ 
        error_message: timeoutError,
        processing_progress: 90 // Keep at 90% to indicate incomplete
      })
      .eq('id', `temp-${leadId}`);

    // Return 200 to allow continuation to Phase 2
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: timeoutError,
        shouldContinue: true // Signal to continue to Phase 2
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error during scan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during scanning',
        shouldContinue: true // Allow continuation to Phase 2 even on error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to allow continuation
      }
    )
  }
})

async function downloadAndUploadImage(imageUrl: string, supabaseClient: any, leadId: string): Promise<string | null> {
  try {
    if (!imageUrl) return null;

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const imageBuffer = await response.arrayBuffer();
    const fileExt = 'jpg';
    const fileName = `${leadId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('contact-avatars')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('contact-avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

const normalizePostType = (type: string): 'post' | 'video' | 'reel' | 'story' | 'igtv' => {
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
};
