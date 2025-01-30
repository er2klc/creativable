import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      console.error('Missing image URL parameter');
      return new Response('Missing image URL', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('Proxying request for:', imageUrl);

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return new Response('Failed to fetch image', { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const contentType = response.headers.get('Content-Type');
    console.log('Content-Type:', contentType);

    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000');

    const imageData = await response.arrayBuffer();
    console.log('Successfully fetched image, size:', imageData.byteLength, 'bytes');

    return new Response(imageData, { 
      headers,
      status: 200 
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});