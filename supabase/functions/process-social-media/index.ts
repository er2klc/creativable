import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mediaUrl, postId, mediaType } = await req.json()

    console.log(`Processing ${mediaType} from URL: ${mediaUrl} for post: ${postId}`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the media file
    const response = await fetch(mediaUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`)
    }
    
    const buffer = await response.arrayBuffer()
    const file = new Uint8Array(buffer)

    // Generate a unique filename with timestamp to avoid collisions
    const timestamp = new Date().getTime()
    const extension = mediaType === 'video' ? '.mp4' : '.jpg'
    const filename = `${postId}-${timestamp}${extension}`
    const filePath = `${postId}/${filename}`

    console.log(`Uploading ${mediaType} to path: ${filePath}`)

    // Upload to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('social-media-files')
      .upload(filePath, file, {
        contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    console.log('File uploaded successfully:', uploadData)

    // Update the post record with the local file path
    const updates = mediaType === 'video'
      ? { local_video_path: filePath }
      : {
          local_media_paths: supabase.sql`array_append(COALESCE(local_media_paths, ARRAY[]::text[]), ${filePath})`
        }

    const { error: updateError } = await supabase
      .from('social_media_posts')
      .update(updates)
      .eq('id', postId)

    if (updateError) {
      console.error('Error updating post:', updateError)
      throw updateError
    }

    console.log(`Successfully processed ${mediaType} for post ${postId}`)

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('social-media-files')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        publicUrl
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing social media:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})