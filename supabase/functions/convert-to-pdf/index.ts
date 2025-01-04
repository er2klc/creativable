import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    console.log('Starting file process...');
    const { filePath, fileType } = await req.json();
    console.log('Received request for file:', filePath, 'of type:', fileType);

    // Simply return success without conversion
    return new Response(
      JSON.stringify({ 
        success: true,
        previewPath: null, // No preview path since we're not converting
      }),
      { 
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error('Error in convert-to-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
      }),
      { 
        headers: corsHeaders,
        status: 500,
      }
    );
  }
});