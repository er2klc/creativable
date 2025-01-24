import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithInstagramHeaders(url: string) {
  console.log('Fetching media from:', url);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.instagram.com/',
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch media:', response.status, response.statusText);
    throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
  }

  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Hole alle Posts mit media_urls die noch nicht lokal gespeichert sind
    const { data: posts, error: fetchError } = await supabase
      .from('social_media_posts')
      .select('id, lead_id, media_urls')
      .is('local_media_paths', null)
      .not('media_urls', 'is', null);

    if (fetchError) throw fetchError;

    console.log(`Found ${posts?.length || 0} posts to process`);

    const results = await Promise.all((posts || []).map(async (post) => {
      try {
        if (!post.media_urls || !Array.isArray(post.media_urls)) {
          console.log(`Skipping post ${post.id} - no media URLs`);
          return null;
        }

        const processedUrls = await Promise.all(post.media_urls.map(async (url, index) => {
          try {
            console.log(`Processing URL for post ${post.id}:`, url);
            const response = await fetchWithInstagramHeaders(url);
            const buffer = await response.arrayBuffer();

            // Get file extension from URL or default to jpg
            const fileExt = url.split('.').pop()?.split('?')[0].toLowerCase() || 'jpg';
            const timestamp = Date.now();
            const bucketPath = `${post.lead_id}/${timestamp}_${index}.${fileExt}`;

            console.log('Uploading to storage:', bucketPath);
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('social-media-files')
              .upload(bucketPath, buffer, {
                contentType: `image/${fileExt}`,
                upsert: true,
                cacheControl: '3600'
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(bucketPath);

            console.log('Media stored at:', publicUrl);
            return publicUrl;
          } catch (error) {
            console.error(`Error processing URL ${url}:`, error);
            return null;
          }
        }));

        const successfulUrls = processedUrls.filter((url): url is string => url !== null);

        if (successfulUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('social_media_posts')
            .update({ 
              local_media_paths: successfulUrls,
              media_urls: successfulUrls 
            })
            .eq('id', post.id);

          if (updateError) {
            console.error('Error updating post:', updateError);
            throw updateError;
          }

          return {
            postId: post.id,
            success: true,
            processedUrls: successfulUrls.length
          };
        }

        return {
          postId: post.id,
          success: false,
          error: 'No URLs were successfully processed'
        };

      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        return {
          postId: post.id,
          success: false,
          error: error.message
        };
      }
    }));

    const successCount = results.filter(r => r?.success).length;
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful: successCount,
        results
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});