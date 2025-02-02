import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 3;
const BATCH_DELAY = 3000;

async function processPostBatch(
  posts: any[],
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  userId: string,
  startIndex: number
): Promise<void> {
  console.log(`Processing batch starting at index ${startIndex} for lead ${leadId}`);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const currentIndex = startIndex + i;
    const progress = Math.round((currentIndex / posts.length) * 100);
    
    try {
      if (post.type?.toLowerCase() === 'video' || post.media_type?.toLowerCase() === 'video') {
        console.log(`Skipping video post ${post.id} (Type: ${post.type || post.media_type})`);
        continue;
      }

      console.log(`Processing post ${currentIndex + 1}/${posts.length}: Post ID ${post.id}, Type: ${post.type || post.media_type}`);
      
      let imageUrls = post.images || [];
      if (!imageUrls.length && post.media_urls) {
        imageUrls = post.media_urls;
      }
      if (!imageUrls.length && post.displayUrl) {
        imageUrls = [post.displayUrl];
      }

      if (!imageUrls || !imageUrls.length) {
        console.log(`No image URLs found for post: ${post.id}`);
        continue;
      }

      const processedImagePaths = [];

      // Update progress in database
      await supabase
        .from('social_media_posts')
        .upsert({
          id: post.id,
          user_id: userId,
          lead_id: leadId,
          processing_progress: progress,
          current_file: imageUrls[0]?.split('/').pop(),
          media_processing_status: 'processing'
        });

      for (const [index, mediaUrl] of imageUrls.entries()) {
        try {
          if (index >= 10) {
            console.log(`Skipping remaining images for post ${post.id} (max 10 reached)`);
            break;
          }

          console.log(`Processing media ${index + 1}/${imageUrls.length} for post ${post.id} (Type: ${post.type || post.media_type})`);
          
          // Generate a clean file path using UUID
          const filePath = `${leadId}/${post.id}_${index}.jpg`;
          
          // Check if file already exists
          const { data: existingFile } = await supabase
            .storage
            .from('social-media-files')
            .list(`${leadId}`);

          const fileExists = existingFile?.some(file => file.name === `${post.id}_${index}.jpg`);
          
          if (fileExists) {
            console.log(`File already exists: ${filePath} for post ${post.id}`);
            const { data } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(filePath);
            processedImagePaths.push(data.publicUrl);
            continue;
          }

          const imageResponse = await fetch(mediaUrl);
          if (!imageResponse.ok) {
            console.error(`Failed to fetch image: ${mediaUrl} for post ${post.id}`);
            continue;
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          
          const { error: uploadError } = await supabase
            .storage
            .from('social-media-files')
            .upload(filePath, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (uploadError) {
            console.error(`Upload error for post ${post.id}:`, uploadError);
            continue;
          }

          const { data } = supabase.storage
            .from('social-media-files')
            .getPublicUrl(filePath);
          
          processedImagePaths.push(data.publicUrl);
          
        } catch (mediaError) {
          console.error(`Error processing media URL ${index} for post ${post.id}:`, mediaError);
          continue;
        }
      }

      if (processedImagePaths.length > 0) {
        const hashtags = post.caption ? 
          (post.caption.match(/#[\w\u0590-\u05ff]+/g) || []) : 
          post.hashtags || [];

        // Use correct case for post_type enum values
        const postType = post.type === 'Sidecar' ? 'Sidecar' : 'Image';

        const { error: insertError } = await supabase
          .from('social_media_posts')
          .upsert({
            id: post.id,
            user_id: userId,
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
            processing_progress: progress
          });

        if (insertError) {
          console.error(`Error inserting social media post ${post.id}:`, insertError);
          continue;
        }

        console.log(`Successfully processed post ${post.id} (Type: ${postType}) with ${processedImagePaths.length} images`);
      }

    } catch (postError) {
      console.error(`Error processing post ${post.id}:`, postError);
      continue;
    }

    if (i < posts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { leadId } = await req.json();
    console.log('Processing media for lead:', leadId);

    if (!leadId) {
      throw new Error('Missing leadId parameter');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user ID from the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('user_id, apify_instagram_data')  // Changed from social_media_posts to apify_instagram_data
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead:', leadError);
      throw leadError;
    }

    if (!lead?.apify_instagram_data) {  // Changed from social_media_posts to apify_instagram_data
      console.log('No Instagram data found for lead:', leadId);
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

    const posts = Array.isArray(lead.apify_instagram_data) ?  // Changed from social_media_posts to apify_instagram_data
      lead.apify_instagram_data : 
      [lead.apify_instagram_data];
    
    console.log(`Found ${posts.length} posts to process`);

    // Process posts in smaller batches with longer delays
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE);
      await processPostBatch(batch, supabase, leadId, lead.user_id, i);
      
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
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
