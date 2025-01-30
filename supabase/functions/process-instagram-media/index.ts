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

    if (!mediaUrl || !leadId || !postId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the media file
    const response = await fetch(mediaUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`)
    }

    const blob = await response.blob()
    const fileExt = mediaUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const fileName = `${leadId}/${postId}_${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('instagram-media')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('instagram-media')
      .getPublicUrl(fileName)

    // Update social_media_posts table
    const { error: updateError } = await supabase
      .from('social_media_posts')
      .update({
        local_media_urls: [publicUrl],
        storage_status: 'completed'
      })
      .eq('id', postId)

    if (updateError) {
      throw updateError
    }

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