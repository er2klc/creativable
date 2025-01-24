import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'
import { compress } from 'https://deno.land/x/image_compress@v0.1.0/mod.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function downloadAndStoreMedia(url: string, postId: string): Promise<string> {
  try {
    // Download the media file
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch media: ${response.statusText}`)
    
    const contentType = response.headers.get('content-type')
    const isVideo = contentType?.includes('video')
    const buffer = await response.arrayBuffer()
    
    // Generate a unique filename
    const extension = isVideo ? '.mp4' : '.jpg'
    const filename = `${postId}${extension}`
    const bucketPath = `social-media/${filename}`

    // Compress image if it's not a video
    let finalBuffer = buffer
    if (!isVideo) {
      try {
        const compressedImage = await compress(new Uint8Array(buffer), {
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 1200
        })
        finalBuffer = compressedImage.buffer
      } catch (error) {
        console.error('Error compressing image:', error)
        // Continue with original buffer if compression fails
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('social-media-files')
      .upload(bucketPath, finalBuffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: true
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('social-media-files')
      .getPublicUrl(bucketPath)

    return publicUrl
  } catch (error) {
    console.error('Error processing media:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { posts } = await req.json()
    
    const processedPosts = await Promise.all(posts.map(async (post: any) => {
      const processedMediaUrls = []
      
      // Process media URLs
      if (post.media_urls && Array.isArray(post.media_urls)) {
        for (const url of post.media_urls) {
          try {
            const localUrl = await downloadAndStoreMedia(url, post.id)
            processedMediaUrls.push(localUrl)
          } catch (error) {
            console.error(`Failed to process media URL ${url}:`, error)
          }
        }
      }

      // Process video URL if present
      let processedVideoUrl = null
      if (post.video_url) {
        try {
          processedVideoUrl = await downloadAndStoreMedia(post.video_url, `${post.id}-video`)
        } catch (error) {
          console.error('Failed to process video URL:', error)
        }
      }

      // Update the post record with local paths
      const { error: updateError } = await supabase
        .from('social_media_posts')
        .update({
          local_media_paths: processedMediaUrls,
          local_video_path: processedVideoUrl
        })
        .eq('id', post.id)

      if (updateError) {
        console.error('Error updating post record:', updateError)
      }

      return {
        ...post,
        local_media_paths: processedMediaUrls,
        local_video_path: processedVideoUrl
      }
    }))

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedPosts 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})