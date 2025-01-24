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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaUrls, leadId } = await req.json();

    if (!Array.isArray(mediaUrls) || !leadId) {
      throw new Error('Invalid request body');
    }

    console.log('Processing media for lead:', leadId);
    console.log('Media URLs:', mediaUrls);

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

          // Get file extension from URL or default to jpg
          const fileExt = url.split('.').pop()?.split('?')[0].toLowerCase() || 'jpg';
          const timestamp = Date.now();
          const bucketPath = `${leadId}/${timestamp}_${index}.${fileExt}`;

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
          console.error('Error processing media:', error);
          return null;
        }
      })
    );

    const successfulUrls = processedUrls.filter((url): url is string => url !== null);

    // Update the lead's social media posts with the new URLs
    if (successfulUrls.length > 0) {
      const { error: updateError } = await supabase
        .from('social_media_posts')
        .update({ 
          local_media_paths: successfulUrls,
          media_urls: successfulUrls 
        })
        .eq('lead_id', leadId);

      if (updateError) {
        console.error('Error updating social media posts:', updateError);
      }
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