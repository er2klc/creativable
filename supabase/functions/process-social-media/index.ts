import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { mediaUrl, postId, mediaType } = await req.json()

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

    const contentType = response.headers.get('content-type')
    const fileData = await response.arrayBuffer()
    
    // Generate unique filename
    const fileExt = mediaType === 'video' ? 'mp4' : 'jpg'
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('social-media-files')
      .upload(fileName, fileData, {
        contentType,
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('social-media-files')
      .getPublicUrl(fileName)

    // Update post with local file path
    const updateData = mediaType === 'video' 
      ? { local_video_path: fileName }
      : { 
          local_media_paths: supabase.sql`array_append(local_media_paths, ${fileName})`
        }

    const { error: updateError } = await supabase
      .from('social_media_posts')
      .update(updateData)
      .eq('id', postId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, path: fileName, url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})