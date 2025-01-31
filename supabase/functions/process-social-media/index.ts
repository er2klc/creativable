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
    const { leadId, posts } = await req.json()
    
    if (!leadId || !posts || !Array.isArray(posts)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing ${posts.length} posts for lead ${leadId}`)
    let progress = 0
    const totalPosts = posts.length

    for (const post of posts) {
      progress += (1 / totalPosts) * 100
      
      const imageUrls = post.media_urls || []
      if (!imageUrls.length) {
        console.log(`No media URLs for post ${post.id}`)
        continue
      }

      // Neue Logik: Direkte URL-Konstruktion basierend auf Schema
      const processedImagePaths = []
      const mediaCount = Math.min(imageUrls.length, 10) // Maximal 10 Bilder pro Post

      // Update progress in database
      await supabase
        .from('social_media_posts')
        .upsert({
          id: post.id,
          lead_id: leadId,
          processing_progress: progress,
          current_file: imageUrls[0]?.split('/').pop(),
          media_processing_status: 'processing',
          media_count: mediaCount // Speichere die Anzahl der Bilder
        })

      for (let index = 0; index < mediaCount; index++) {
        try {
          const mediaUrl = imageUrls[index]
          if (!mediaUrl) continue

          // Generiere einen sauberen Dateipfad nach Schema: leadId/postId_index.jpg
          const filePath = `${leadId}/${post.id}_${index}.jpg`
          
          // Prüfe ob die Datei bereits existiert
          const { data: existingFile } = await supabase
            .storage
            .from('social-media-files')
            .list(leadId)

          const fileExists = existingFile?.some(file => file.name === `${post.id}_${index}.jpg`)
          
          if (fileExists) {
            console.log(`File already exists: ${filePath}`)
            const { data } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(filePath)
            processedImagePaths.push(data.publicUrl)
            continue
          }

          const imageResponse = await fetch(mediaUrl)
          if (!imageResponse.ok) {
            console.error(`Failed to fetch image: ${mediaUrl}`)
            continue
          }

          const imageBuffer = await imageResponse.arrayBuffer()

          const { error: uploadError } = await supabase
            .storage
            .from('social-media-files')
            .upload(filePath, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            })

          if (uploadError) {
            console.error('Error uploading file:', uploadError)
            continue
          }

          const { data } = supabase.storage
            .from('social-media-files')
            .getPublicUrl(filePath)

          processedImagePaths.push(data.publicUrl)

        } catch (error) {
          console.error(`Error processing media for post ${post.id}:`, error)
          continue
        }
      }

      try {
        const hashtags = post.caption ? 
          (post.caption.match(/#[\w\u0590-\u05ff]+/g) || []) : 
          post.hashtags || []

        const postType = post.type === 'Sidecar' ? 'Sidecar' : 'Image'

        const { error: insertError } = await supabase
          .from('social_media_posts')
          .upsert({
            id: post.id,
            lead_id: leadId,
            platform: 'Instagram',
            post_type: postType,
            content: post.caption,
            url: post.url,
            posted_at: post.timestamp,
            media_urls: processedImagePaths,
            media_type: postType,
            media_processing_status: 'processed',
            hashtags: hashtags,
            processing_progress: progress,
            media_count: processedImagePaths.length // Aktualisiere die tatsächliche Anzahl der verarbeiteten Bilder
          })

        if (insertError) {
          console.error('Error inserting post:', insertError)
        }

      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})