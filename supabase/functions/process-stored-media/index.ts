import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function downloadAndUploadMedia(url: string, leadId: string): Promise<string | null> {
  console.log(`Processing media URL: ${url} for lead: ${leadId}`)
  try {
    // Download the file
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      console.error(`Failed to download media from ${url}. Status: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type')
    if (!contentType) {
      console.error(`No content type found for ${url}`)
      return null
    }

    // Determine file extension
    let extension = 'jpg'
    if (contentType.includes('video')) {
      extension = 'mp4'
    } else if (contentType.includes('image')) {
      extension = contentType.includes('png') ? 'png' : 'jpg'
    }

    // Create a unique filename
    const filename = `${leadId}-${Date.now()}.${extension}`
    const filePath = `${leadId}/${filename}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('social-media-files')
      .upload(filePath, await response.blob(), {
        contentType,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('social-media-files')
      .getPublicUrl(filePath)

    console.log(`Successfully processed media. New URL: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error('Error processing media:', error)
    return null
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { leadId } = await req.json()
    console.log(`Starting media processing${leadId ? ` for lead: ${leadId}` : ' for all unprocessed posts'}`)

    // Query to get posts that need processing
    let query = supabase
      .from('social_media_posts')
      .select('*')
      .is('local_media_paths', null)
      .not('media_urls', 'eq', '{}')
      .not('media_urls', 'is', null)

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    const { data: posts, error: queryError } = await query

    if (queryError) {
      throw queryError
    }

    console.log(`Found ${posts?.length || 0} posts to process`)

    // Process each post
    for (const post of posts || []) {
      if (!post.media_urls || !Array.isArray(post.media_urls)) continue

      const processedUrls: string[] = []
      
      for (const url of post.media_urls) {
        if (!url) continue
        
        const processedUrl = await downloadAndUploadMedia(url, post.lead_id)
        if (processedUrl) {
          processedUrls.push(processedUrl)
        }
      }

      // Update the post with processed URLs
      if (processedUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('social_media_posts')
          .update({
            local_media_paths: processedUrls
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`Failed to update post ${post.id}:`, updateError)
        } else {
          console.log(`Successfully updated post ${post.id} with ${processedUrls.length} media files`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed posts`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})