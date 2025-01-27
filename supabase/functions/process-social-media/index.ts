import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaType, mediaUrl, leadId, platform, postId } = await req.json();
    console.log('Processing media:', { mediaType, platform, leadId, postId });

    if (!mediaUrl) {
      console.error('Missing mediaUrl parameter');
      throw new Error('Missing mediaUrl parameter');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download media
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      console.error('Failed to fetch media:', response.statusText);
      
      // Update status to error in social_media_posts
      if (platform === 'Instagram' && postId) {
        const { error: updateError } = await supabase
          .from('social_media_posts')
          .update({
            media_processing_status: 'error'
          })
          .eq('id', postId)
          .eq('lead_id', leadId);

        if (updateError) {
          console.error('Error updating social media post status:', updateError);
        }
      }
      
      throw new Error('Failed to fetch media');
    }
    
    const blob = await response.arrayBuffer();
    const timestamp = new Date().getTime();
    
    // Determine storage bucket and path based on platform and type
    let bucketName = 'social-media-files';
    let filePath = '';
    let finalBucketPath = '';

    if (platform === 'Instagram') {
      // Use contact-avatars bucket for profile images
      bucketName = mediaType === 'profile' ? 'contact-avatars' : 'social-media-files';
      
      // Generate unique file path using postId if available
      const fileExt = mediaType === 'video' ? 'mp4' : 'jpg';
      const fileIdentifier = postId || timestamp;
      filePath = `instagram/${leadId}/${fileIdentifier}.${fileExt}`;
      finalBucketPath = filePath;
      
      console.log('Instagram media path:', { bucketName, filePath });
    } else if (platform === 'LinkedIn') {
      bucketName = mediaType === 'profile' ? 'contact-avatars' : 'linkedin-media';
      const fileExt = mediaType === 'video' ? 'mp4' : 'jpg';
      filePath = `linkedin/${leadId}/${timestamp}.${fileExt}`;
      finalBucketPath = filePath;
    }

    console.log('Storing media in:', { bucketName, filePath });

    // Upload to appropriate bucket
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, blob, {
        contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Update status to error in social_media_posts
      if (platform === 'Instagram' && postId) {
        const { error: updateError } = await supabase
          .from('social_media_posts')
          .update({
            media_processing_status: 'error',
            bucket_path: null
          })
          .eq('id', postId)
          .eq('lead_id', leadId);

        if (updateError) {
          console.error('Error updating social media post status:', updateError);
        }
      }
      
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl }, error: publicUrlError } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (publicUrlError) {
      console.error('Error generating public URL:', publicUrlError);
      throw publicUrlError;
    }

    console.log('Media processed and stored:', publicUrl);

    // If this is an Instagram post image, update the social_media_posts table
    if (platform === 'Instagram' && postId && mediaType !== 'profile') {
      const { error: updateError } = await supabase
        .from('social_media_posts')
        .update({
          local_media_paths: [filePath],
          media_urls: [publicUrl],
          bucket_path: finalBucketPath,
          media_processing_status: 'processed'
        })
        .eq('id', postId)
        .eq('lead_id', leadId);

      if (updateError) {
        console.error('Error updating social media post:', updateError);
        throw updateError;
      }
      
      console.log('Successfully updated social media post:', { postId, filePath, publicUrl });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        publicUrl,
        bucketPath: finalBucketPath
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing media:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});