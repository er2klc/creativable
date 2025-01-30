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
    const { mediaUrls, leadId, postId } = await req.json()
    console.log('Processing media for:', { mediaUrls, leadId, postId })

    if (!mediaUrls || !leadId || !postId) {
      console.error('Missing required parameters:', { mediaUrls, leadId, postId })
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const processedUrls: string[] = [];
    const processedPaths: string[] = [];

    for (const mediaUrl of mediaUrls) {
      try {
        console.log('Downloading media from:', mediaUrl)
        const response = await fetch(mediaUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch media: ${response.statusText}`)
        }

        const blob = await response.blob()
        const fileName = `${postId}_${Date.now()}_${processedUrls.length}.jpg`
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
        processedUrls.push(publicUrl);
        processedPaths.push(filePath);

      } catch (error) {
        console.error('Error processing media URL:', mediaUrl, error)
      }
    }

    if (processedUrls.length > 0) {
      const { error: updateError } = await supabase
        .from('social_media_posts')
        .update({
          local_media_paths: processedPaths,
          local_media_urls: processedUrls,
          storage_status: 'completed'
        })
        .eq('id', postId)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      console.log('Post updated successfully')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedUrls,
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