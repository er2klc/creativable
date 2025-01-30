import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { mediaUrl, leadId, postId } = await req.json()
    console.log('Processing media for:', { mediaUrl, leadId, postId })

    if (!mediaUrl || !leadId || !postId) {
      console.error('Missing required parameters:', { mediaUrl, leadId, postId })
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Downloading media from:', mediaUrl)
    const response = await fetch(mediaUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`)
    }

    const blob = await response.blob()
    const fileName = `${postId}_${Date.now()}.jpg`
    const filePath = `${leadId}/${fileName}`

    console.log('Uploading to storage:', filePath)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('instagram-media')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('instagram-media')
      .getPublicUrl(filePath)

    console.log('File uploaded successfully:', publicUrl)

    const { error: updateError } = await supabase
      .from('social_media_posts')
      .update({
        local_media_paths: [filePath],
        local_media_urls: [publicUrl],
        storage_status: 'completed'
      })
      .eq('id', postId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    console.log('Post updated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        publicUrl,
        message: 'Media processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing media:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})