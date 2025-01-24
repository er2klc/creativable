import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function downloadAndStoreMedia(url: string, postId: string): Promise<string> {
  try {
    console.log('Downloading media from:', url)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch media: ${response.statusText}`)
    
    const contentType = response.headers.get('content-type')
    const isVideo = contentType?.includes('video')
    const buffer = await response.arrayBuffer()
    
    const extension = isVideo ? '.mp4' : '.jpg'
    const filename = `${postId}${extension}`
    const bucketPath = `social-media/${filename}`

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('Uploading to storage:', bucketPath)
    const { data, error } = await supabase
      .storage
      .from('social-media-files')
      .upload(bucketPath, buffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase
      .storage
      .from('social-media-files')
      .getPublicUrl(bucketPath)

    console.log('File uploaded successfully:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Error processing media:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing social media request')
    const { posts } = await req.json()
    
    const processedPosts = await Promise.all(posts.map(async (post: any) => {
      const processedMediaUrls = []
      
      if (post.media_urls && Array.isArray(post.media_urls)) {
        console.log(`Processing ${post.media_urls.length} media files for post:`, post.id)
        for (const url of post.media_urls) {
          try {
            const localUrl = await downloadAndStoreMedia(url, post.id)
            processedMediaUrls.push(localUrl)
          } catch (error) {
            console.error(`Failed to process media URL ${url}:`, error)
          }
        }
      }

      let processedVideoUrl = null
      if (post.video_url) {
        try {
          console.log('Processing video for post:', post.id)
          processedVideoUrl = await downloadAndStoreMedia(post.video_url, `${post.id}-video`)
        } catch (error) {
          console.error('Failed to process video URL:', error)
        }
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      console.log('Updating post record:', post.id)
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