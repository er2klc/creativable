import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Download and store media
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    
    const timestamp = new Date().getTime();
    const fileName = `${platform}-${leadId}-${timestamp}`;
    const filePath = `${platform}/${leadId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('social-media-files')
      .upload(filePath, blob, {
        contentType: mediaType,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase
      .storage
      .from('social-media-files')
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