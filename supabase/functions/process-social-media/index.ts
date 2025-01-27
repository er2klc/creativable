import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaUrl, leadId, platform, postId, mediaType } = await req.json();
    console.log('Processing media:', { mediaUrl, platform, leadId, postId, mediaType });

    if (!mediaUrl) {
      console.error('Missing mediaUrl parameter:', { leadId, platform, postId });
      throw new Error('Missing mediaUrl parameter');
    }

    // Skip video processing
    if (mediaType?.toLowerCase() === 'video') {
      console.log('Skipping video processing:', { mediaUrl, postId });
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Video processing skipped',
          mediaUrl 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download image
    console.log('Downloading image from:', mediaUrl);
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
    const filePath = `instagram/${leadId}/${postId}_${timestamp}.jpg`;
    
    console.log('Uploading compressed image to bucket:', filePath);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
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

    // Get public URL
    const { data: { publicUrl }, error: publicUrlError } = supabase
      .storage
      .from('social-media-files')
      .getPublicUrl(filePath);

    if (publicUrlError) {
      console.error('Error generating public URL:', publicUrlError);
      throw publicUrlError;
    }

    // Update social_media_posts table
    const { error: updateError } = await supabase
      .from('social_media_posts')
      .update({
        bucket_path: filePath,
        media_urls: [publicUrl],
        media_processing_status: 'processed'
      })
      .eq('id', postId)
      .eq('lead_id', leadId);

    if (updateError) {
      console.error('Error updating social media post:', updateError);
      throw updateError;
    }

    console.log('Successfully processed image:', {
      postId,
      bucketPath: filePath,
      publicUrl
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        filePath,
        publicUrl,
        message: 'Image processed and stored successfully'
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