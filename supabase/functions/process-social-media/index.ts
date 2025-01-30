import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
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

    // Get lead data to access social_media_posts
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('social_media_posts')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead:', leadError);
      throw leadError;
    }

    if (!lead?.social_media_posts || !Array.isArray(lead.social_media_posts)) {
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

    console.log(`Found ${lead.social_media_posts.length} posts to process`);

    for (const post of lead.social_media_posts) {
      try {
        if (!post.media_urls?.length) {
          console.log('No media URLs for post:', post.id);
          continue;
        }

        for (const mediaUrl of post.media_urls) {
          try {
            console.log('Processing media URL:', mediaUrl, 'for post:', post.id);

            // Skip video processing
            if (post.media_type?.toLowerCase() === 'video') {
              console.log('Skipping video processing:', { mediaUrl, post });
              continue;
            }

            // Download image
            const imageResponse = await fetch(mediaUrl);
            if (!imageResponse.ok) {
              throw new Error('Failed to fetch image');
            }

            // Get image buffer
            const imageBuffer = await imageResponse.arrayBuffer();

            // Process and compress image using ImageScript
            const image = await Image.decode(new Uint8Array(imageBuffer));
            
            // Calculate new dimensions while maintaining aspect ratio
            const MAX_SIZE = 800;
            let width = image.width;
            let height = image.height;
            
            if (width > MAX_SIZE || height > MAX_SIZE) {
              if (width > height) {
                height = Math.round((height * MAX_SIZE) / width);
                width = MAX_SIZE;
              } else {
                width = Math.round((width * MAX_SIZE) / height);
                height = MAX_SIZE;
              }
              image.resize(width, height);
            }

            // Encode with quality reduction (JPEG compression)
            const compressedImageBuffer = await image.encodeJPEG(70);

            // Generate file path
            const timestamp = new Date().getTime();
            const filePath = `instagram/${leadId}/${post.id}_${timestamp}.jpg`;
            
            console.log('Uploading compressed image to bucket:', filePath);

            // Upload to storage
            const { error: uploadError } = await supabase
              .storage
              .from('social-media-files')
              .upload(filePath, compressedImageBuffer, {
                contentType: 'image/jpeg',
                upsert: true
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw uploadError;
            }

            // Create entry in social_media_posts table
            const { error: insertError } = await supabase
              .from('social_media_posts')
              .insert({
                id: post.id,
                lead_id: leadId,
                platform: 'Instagram',
                post_type: post.type || 'post',
                content: post.caption,
                likes_count: post.likesCount,
                comments_count: post.commentsCount,
                url: post.url,
                location: post.locationName,
                posted_at: post.timestamp,
                media_urls: [mediaUrl],
                bucket_path: filePath,
                media_type: 'image',
                media_processing_status: 'processed',
                hashtags: post.hashtags,
                first_comment: post.firstComment,
                engagement_count: post.engagementCount
              });

            if (insertError) {
              console.error('Error inserting social media post:', insertError);
              throw insertError;
            }

            console.log('Successfully processed image for post:', post.id);

          } catch (mediaError) {
            console.error('Error processing media:', mediaError, 'for post:', post.id);
            // Continue with next media URL even if one fails
          }
        }
      } catch (postError) {
        console.error('Error processing post:', postError);
        // Continue with next post even if one fails
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