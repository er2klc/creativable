import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { LibreOfficeWeb } from 'https://esm.sh/libreoffice-web@0.1.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { filePath, fileType } = await req.json()
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the original file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('elevate-documents')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Error downloading file: ${downloadError.message}`)
    }

    // Convert to PDF using LibreOffice Web
    const libreOffice = new LibreOfficeWeb()
    const pdfBuffer = await libreOffice.convert(await fileData.arrayBuffer(), 'pdf')

    // Generate new PDF file path
    const pdfPath = filePath.replace(/\.(xlsx|docx)$/i, '.pdf')

    // Upload the converted PDF
    const { error: uploadError } = await supabase.storage
      .from('elevate-documents')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Error uploading PDF: ${uploadError.message}`)
    }

    // Get the public URL of the PDF
    const { data: { publicUrl } } = supabase.storage
      .from('elevate-documents')
      .getPublicUrl(pdfPath)

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfPath,
        publicUrl
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Conversion error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})