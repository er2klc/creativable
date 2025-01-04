import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { LibreOffice } from 'https://deno.land/x/libreoffice@0.1.0/mod.ts';

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

    // Convert to PDF using LibreOffice
    const libreOffice = new LibreOffice();
    const pdfBuffer = await libreOffice.convert(new Uint8Array(await fileData.arrayBuffer()), 'pdf');

    // Upload the converted PDF
    const pdfPath = filePath.replace(/\.[^/.]+$/, '.pdf');
    
    const { error: uploadError } = await supabase
      .storage
      .from('elevate-documents')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error uploading PDF: ${uploadError.message}`);
    }

    console.log(`Successfully converted ${filePath} to PDF`);

    return new Response(
      JSON.stringify({ previewPath: pdfPath }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in convert-to-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})