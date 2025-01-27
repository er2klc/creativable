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
    const { mediaType, mediaUrl, leadId, platform } = await req.json();
    console.log('Processing media:', { mediaType, platform, leadId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download media
    const response = await fetch(mediaUrl);
    if (!response.ok) throw new Error('Failed to fetch media');
    
    const blob = await response.arrayBuffer();
    const timestamp = new Date().getTime();
    
    // Determine storage bucket and path based on platform and type
    let bucketName = 'social-media-files';
    let filePath = '';

    if (platform === 'Instagram') {
      bucketName = mediaType === 'profile' ? 'contact-avatars' : 'social-media-files';
      const fileExt = mediaType === 'video' ? 'mp4' : 'jpg';
      filePath = `instagram/${leadId}/${timestamp}.${fileExt}`;
    } else if (platform === 'LinkedIn') {
      bucketName = mediaType === 'profile' ? 'contact-avatars' : 'linkedin-media';
      const fileExt = mediaType === 'video' ? 'mp4' : 'jpg';
      filePath = `linkedin/${leadId}/${timestamp}.${fileExt}`;
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
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('Media processed and stored:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        publicUrl
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