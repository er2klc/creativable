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
      'Cookie': 'ig_did=; ig_nrcb=1; csrftoken=; mid=; ds_user_id=; sessionid=;'
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
    const { mediaUrls, leadId, mediaType, postId } = await req.json();

    if (!Array.isArray(mediaUrls) || !leadId) {
      throw new Error('Invalid request body');
    }

    console.log('Processing media for lead:', leadId);
    console.log('Media URLs:', mediaUrls);
    console.log('Media Type:', mediaType);
    console.log('Post ID:', postId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const processedUrls = await Promise.all(
      mediaUrls.map(async (url, index) => {
        try {
          console.log('Downloading media from:', url);
          const response = await fetchWithInstagramHeaders(url);
          const buffer = await response.arrayBuffer();

          // Get file extension from URL or content type
          let fileExt = 'jpg'; // default
          if (mediaType === 'video' || url.includes('.mp4')) {
            fileExt = 'mp4';
          } else if (url.includes('.png')) {
            fileExt = 'png';
          }

          const timestamp = Date.now();
          const bucketPath = `${leadId}/${timestamp}_${index}.${fileExt}`;

          console.log('Uploading to storage:', bucketPath);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('social-media-files')
            .upload(bucketPath, buffer, {
              contentType: mediaType === 'video' ? 'video/mp4' : `image/${fileExt}`,
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
          return bucketPath;
        } catch (error) {
          console.error('Error processing media:', error);
          return null;
        }
      })
    );

    const successfulUrls = processedUrls.filter((url): url is string => url !== null);

    // Update the social media post with the new URLs only if we have a valid postId
    if (successfulUrls.length > 0 && postId) {
      console.log('Updating post with ID:', postId);
      console.log('Successful URLs:', successfulUrls);
      
      const updates: Record<string, any> = {};
      
      if (mediaType === 'video') {
        updates.local_video_path = successfulUrls[0];
        // Store preview image if available
        if (successfulUrls.length > 1) {
          updates.local_media_paths = [successfulUrls[1]];
        }
      } else {
        updates.local_media_paths = successfulUrls;
      }

      const { error: updateError } = await supabase
        .from('social_media_posts')
        .update(updates)
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating social media posts:', updateError);
        throw updateError;
      }
    } else {
      console.log('Skipping database update - no valid postId provided or no successful uploads');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        urls: successfulUrls,
        message: `Successfully processed ${successfulUrls.length} of ${mediaUrls.length} media files`
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