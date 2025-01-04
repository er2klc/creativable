import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { ExcelJS } from 'npm:exceljs@4.4.0'
import { PDFDocument, rgb } from 'npm:pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log('Starting file conversion process...')
    const { filePath, fileType } = await req.json()
    console.log('Received request for file:', filePath, 'of type:', fileType)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the original file
    console.log('Downloading file from storage...')
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('elevate-documents')
      .download(filePath)

    if (downloadError) {
      console.error('Error downloading file:', downloadError)
      throw new Error(`Error downloading file: ${downloadError.message}`)
    }

    // Convert Excel to PDF
    console.log('Converting file to PDF...')
    const workbook = new ExcelJS.Workbook()
    const arrayBuffer = await fileData.arrayBuffer()
    await workbook.xlsx.load(arrayBuffer)

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Process each worksheet
    for (const worksheet of workbook.worksheets) {
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      const fontSize = 12
      
      let yOffset = height - 50

      // Add worksheet name as title
      page.drawText(worksheet.name, {
        x: 50,
        y: yOffset,
        size: fontSize + 4,
        color: rgb(0, 0, 0),
      })
      yOffset -= 30

      // Process each row
      worksheet.eachRow((row, rowNumber) => {
        let xOffset = 50
        
        row.eachCell((cell, colNumber) => {
          if (yOffset > 50) { // Ensure we don't write below the page
            const cellText = cell.text?.toString() || '';
            page.drawText(cellText, {
              x: xOffset,
              y: yOffset,
              size: fontSize,
              color: rgb(0, 0, 0),
            })
          }
          xOffset += 100 // Move to next column
        })
        
        yOffset -= 20 // Move to next row
        if (yOffset <= 50) {
          // Add new page if needed
          page = pdfDoc.addPage()
          yOffset = height - 50
        }
      })
    }

    // Save the PDF
    console.log('Saving PDF...')
    const pdfBytes = await pdfDoc.save()
    const previewPath = filePath.replace(/\.[^/.]+$/, '.pdf')

    console.log('Uploading preview to:', previewPath)

    // Upload the PDF preview
    const { error: uploadError } = await supabase
      .storage
      .from('elevate-documents')
      .upload(previewPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading PDF preview:', uploadError)
      throw new Error(`Error uploading PDF preview: ${uploadError.message}`)
    }

    console.log('Conversion completed successfully')
    return new Response(
      JSON.stringify({ 
        success: true,
        previewPath 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in convert-to-pdf function:', error)
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