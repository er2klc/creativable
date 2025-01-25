import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mediaUrls, leadId, mediaType, postId } = await req.json();
    
    console.log('Processing media:', {
      leadId,
      postId,
      mediaType,
      mediaUrls
    });

    if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
      console.log('No media URLs provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No media URLs provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!leadId) {
      console.log('No leadId provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No leadId provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const localPaths: string[] = [];
    let localVideoPath: string | null = null;

    for (const [index, url] of mediaUrls.entries()) {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${index}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
        const filePath = `${leadId}/${fileName}`;

        // Check if file already exists
        const { data: existingFiles } = await supabase
          .storage
          .from('social-media-files')
          .list(leadId, {
            search: fileName
          });

        if (existingFiles && existingFiles.length > 0) {
          console.log('File already exists, skipping download:', fileName);
          const { data: { publicUrl } } = supabase
            .storage
            .from('social-media-files')
            .getPublicUrl(filePath);
          
          if (mediaType === 'video') {
            localVideoPath = publicUrl;
          } else {
            localPaths.push(publicUrl);
          }
          continue;
        }

        console.log('Downloading media from URL:', url);
        const mediaResponse = await fetch(url);
        
        if (!mediaResponse.ok) {
          throw new Error(`Failed to fetch media: ${mediaResponse.statusText}`);
        }

        const mediaBuffer = await mediaResponse.arrayBuffer();

        console.log('Uploading media to storage:', filePath);
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('social-media-files')
          .upload(filePath, mediaBuffer, {
            contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase
          .storage
          .from('social-media-files')
          .getPublicUrl(filePath);

        console.log('Media stored at:', publicUrl);

        if (mediaType === 'video') {
          localVideoPath = publicUrl;
        } else {
          localPaths.push(publicUrl);
        }

      } catch (error) {
        console.error('Error processing media URL:', url, error);
      }
    }

    // Update the post with local paths if we have a postId
    if (postId) {
      console.log('Updating post with local paths:', {
        postId,
        localPaths,
        localVideoPath
      });

      const { error: updateError } = await supabase
        .from('social_media_posts')
        .update({
          local_media_paths: localPaths,
          local_video_path: localVideoPath
        })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating post with local paths:', updateError);
        throw updateError;
      }
    } else {
      console.log('Skipping database update - no valid postId provided');
    }

    return new Response(
      JSON.stringify({
        success: true,
        localPaths,
        localVideoPath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing social media:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing media'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});