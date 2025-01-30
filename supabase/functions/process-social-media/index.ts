import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CONCURRENT_IMAGES = 2; // Process images in smaller batches
const MAX_IMAGE_SIZE = 800;
const JPEG_QUALITY = 70;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting process-social-media function');
    
    const { leadId } = await req.json();
    console.log('Processing media for lead:', leadId);

    if (!leadId) {
      console.error('Missing leadId parameter');
      throw new Error('Missing leadId parameter');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('social_media_posts')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead:', leadError);
      throw leadError;
    }

    if (!lead?.social_media_posts) {
      console.log('No social media posts found for lead:', leadId);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No posts to process'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const posts = Array.isArray(lead.social_media_posts) ? lead.social_media_posts : [lead.social_media_posts];
    console.log(`Found ${posts.length} posts to process`);

    // Process posts in batches to avoid CPU time limits
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      try {
        console.log('Processing post:', post.id);
        
        let imageUrls = post.images || [];
        if (!imageUrls.length && post.media_urls) {
          imageUrls = post.media_urls;
        }

        if (!imageUrls || !imageUrls.length) {
          console.log('No image URLs found for post:', post.id);
          continue;
        }

        console.log(`Found ${imageUrls.length} images for post:`, post.id);
        const processedImagePaths = [];

        // Process images in smaller batches
        for (let j = 0; j < imageUrls.length; j += MAX_CONCURRENT_IMAGES) {
          const batch = imageUrls.slice(j, j + MAX_CONCURRENT_IMAGES);
          const batchPromises = batch.map(async (imageUrl) => {
            try {
              console.log('Processing image URL:', imageUrl);

              const imageResponse = await fetch(imageUrl);
              if (!imageResponse.ok) {
                console.error('Failed to fetch image:', imageUrl);
                return null;
              }

              const imageBuffer = await imageResponse.arrayBuffer();
              const image = await Image.decode(new Uint8Array(imageBuffer));
              
              let width = image.width;
              let height = image.height;
              
              if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
                if (width > height) {
                  height = Math.round((height * MAX_IMAGE_SIZE) / width);
                  width = MAX_IMAGE_SIZE;
                } else {
                  width = Math.round((width * MAX_IMAGE_SIZE) / height);
                  height = MAX_IMAGE_SIZE;
                }
                image.resize(width, height);
              }

              const compressedImageBuffer = await image.encodeJPEG(JPEG_QUALITY);
              const filePath = `instagram/${leadId}/${post.id}_${processedImagePaths.length}.jpg`;
              
              console.log('Uploading compressed image to bucket:', filePath);

              const { error: uploadError } = await supabase
                .storage
                .from('social-media-files')
                .upload(filePath, compressedImageBuffer, {
                  contentType: 'image/jpeg',
                  upsert: true
                });

              if (uploadError) {
                console.error('Upload error:', uploadError);
                return null;
              }

              return filePath;
            } catch (imageError) {
              console.error('Error processing image:', imageError);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          processedImagePaths.push(...batchResults.filter(Boolean));
          
          // Add a small delay between batches to prevent CPU overload
          if (j + MAX_CONCURRENT_IMAGES < imageUrls.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (processedImagePaths.length > 0) {
          const hashtags = post.caption ? 
            (post.caption.match(/#[\w\u0590-\u05ff]+/g) || []) : 
            [];

          const { error: insertError } = await supabase
            .from('social_media_posts')
            .insert({
              id: post.id,
              lead_id: leadId,
              platform: 'Instagram',
              post_type: post.type || 'post',
              content: post.caption,
              url: post.url,
              posted_at: post.timestamp,
              media_urls: imageUrls,
              local_media_paths: processedImagePaths,
              media_type: 'image',
              media_processing_status: 'processed',
              hashtags: hashtags
            });

          if (insertError) {
            console.error('Error inserting social media post:', insertError);
            continue;
          }

          console.log('Successfully processed post:', post.id);
        }

      } catch (postError) {
        console.error('Error processing post:', postError);
        continue;
      }

      // Add a delay between posts to prevent CPU overload
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'All posts processed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing media:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});