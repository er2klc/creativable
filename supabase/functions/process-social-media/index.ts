import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 2; // Process 2 posts at a time
const BATCH_DELAY = 2000; // 2 second delay between batches
const MAX_IMAGE_SIZE = 800;
const JPEG_QUALITY = 70;

async function processPostBatch(
  posts: any[],
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  startIndex: number
): Promise<void> {
  console.log(`Processing batch starting at index ${startIndex}`);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const currentIndex = startIndex + i;
    const progress = Math.round((currentIndex / posts.length) * 100);
    
    try {
      console.log(`Processing post ${currentIndex + 1}/${posts.length}: ${post.id}`);
      
      // Handle different image URL sources
      let imageUrls = post.images || [];
      if (!imageUrls.length && post.media_urls) {
        imageUrls = post.media_urls;
      }
      // Add support for displayUrl
      if (!imageUrls.length && post.displayUrl) {
        imageUrls = [post.displayUrl];
      }

      if (!imageUrls || !imageUrls.length) {
        console.log('No image URLs found for post:', post.id);
        continue;
      }

      const processedImagePaths = [];

      for (const mediaUrl of imageUrls) {
        try {
          console.log('Processing media URL:', mediaUrl);
          
          // Update progress in database
          await supabase
            .from('social_media_posts')
            .upsert({
              id: post.id,
              lead_id: leadId,
              processing_progress: progress,
              current_file: mediaUrl.split('/').pop(),
              media_processing_status: 'processing'
            });

          const imageResponse = await fetch(mediaUrl);
          if (!imageResponse.ok) {
            console.error('Failed to fetch image:', mediaUrl);
            continue;
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
          
          const { error: uploadError } = await supabase
            .storage
            .from('social-media-files')
            .upload(filePath, compressedImageBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          processedImagePaths.push(filePath);
          
        } catch (mediaError) {
          console.error('Error processing media:', mediaError);
          continue;
        }
      }

      if (processedImagePaths.length > 0) {
        const hashtags = post.caption ? 
          (post.caption.match(/#[\w\u0590-\u05ff]+/g) || []) : 
          post.hashtags || [];

        const { error: insertError } = await supabase
          .from('social_media_posts')
          .upsert({
            id: post.id,
            lead_id: leadId,
            platform: 'Instagram',
            post_type: post.type || 'post',
            content: post.caption,
            url: post.url,
            posted_at: post.timestamp,
            media_urls: imageUrls,
            local_media_paths: processedImagePaths,
            media_type: post.type || 'image',
            media_processing_status: 'processed',
            hashtags: hashtags,
            processing_progress: progress
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
  }
}

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

    const posts = Array.isArray(lead.social_media_posts) ? 
      lead.social_media_posts : 
      [lead.social_media_posts];
    
    console.log(`Found ${posts.length} posts to process`);

    // Process posts in batches
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE);
      await processPostBatch(batch, supabase, leadId, i);
      
      // Add delay between batches if not the last batch
      if (i + BATCH_SIZE < posts.length) {
        console.log(`Waiting ${BATCH_DELAY}ms before processing next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
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