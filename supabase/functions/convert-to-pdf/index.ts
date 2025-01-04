import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import mammoth from 'npm:mammoth@1.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { filePath, fileType } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the original file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('elevate-documents')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Error downloading file: ${downloadError.message}`);
    }

    let htmlContent;
    if (fileType.includes('word') || filePath.endsWith('.docx')) {
      // Convert DOCX to HTML using mammoth
      const arrayBuffer = await fileData.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      htmlContent = result.value;

      // Create a simple HTML wrapper with some basic styling
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 40px;
                max-width: 800px;
                margin: 40px auto;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      // Upload the HTML as preview
      const previewPath = filePath.replace(/\.[^/.]+$/, '.html');
      
      const { error: uploadError } = await supabase
        .storage
        .from('elevate-documents')
        .upload(previewPath, fullHtml, {
          contentType: 'text/html',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Error uploading HTML preview: ${uploadError.message}`);
      }

      return new Response(
        JSON.stringify({ previewPath }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // For other file types (like Excel), we'll keep the original path for now
      // In a future implementation, we can add conversion logic for other formats
      const previewPath = filePath;
      
      return new Response(
        JSON.stringify({ previewPath }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
