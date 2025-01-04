import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { ExcelJS } from 'npm:exceljs@4.4.0'
import { PDFDocument, rgb } from 'npm:pdf-lib@1.17.1'

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

    if (fileType.includes('sheet') || filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
      // Convert Excel to PDF
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await fileData.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Process each worksheet
      for (const worksheet of workbook.worksheets) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 12;
        
        let yOffset = height - 50;

        // Add worksheet name as title
        page.drawText(worksheet.name, {
          x: 50,
          y: yOffset,
          size: fontSize + 4,
          color: rgb(0, 0, 0),
        });
        yOffset -= 30;

        // Process each row
        worksheet.eachRow((row, rowNumber) => {
          let xOffset = 50;
          
          row.eachCell((cell, colNumber) => {
            if (yOffset > 50) { // Ensure we don't write below the page
              page.drawText(cell.text.toString(), {
                x: xOffset,
                y: yOffset,
                size: fontSize,
                color: rgb(0, 0, 0),
              });
            }
            xOffset += 100; // Move to next column
          });
          
          yOffset -= 20; // Move to next row
          if (yOffset <= 50) {
            // Add new page if needed
            page = pdfDoc.addPage();
            yOffset = height - 50;
          }
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const previewPath = filePath.replace(/\.[^/.]+$/, '.pdf');

      const { error: uploadError } = await supabase
        .storage
        .from('elevate-documents')
        .upload(previewPath, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Error uploading PDF preview: ${uploadError.message}`);
      }

      return new Response(
        JSON.stringify({ previewPath }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (fileType.includes('word') || filePath.endsWith('.docx') || filePath.endsWith('.doc')) {
      // For Word documents, create a simple PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      // Add a simple text message
      page.drawText('Word document preview is being processed...', {
        x: 50,
        y: height - 50,
        size: 12,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const previewPath = filePath.replace(/\.[^/.]+$/, '.pdf');

      const { error: uploadError } = await supabase
        .storage
        .from('elevate-documents')
        .upload(previewPath, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Error uploading PDF preview: ${uploadError.message}`);
      }

      return new Response(
        JSON.stringify({ previewPath }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // For other file types, return the original path
      return new Response(
        JSON.stringify({ previewPath: filePath }),
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