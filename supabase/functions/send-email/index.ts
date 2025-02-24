
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to ensure proper HTML email structure
function formatEmailContent(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
        ${content}
      </body>
    </html>
  `.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1]);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Unauthorized');
    }

    // Get request body
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);

    const { to, subject, html, lead_id } = requestBody;

    if (!to || !subject || !html) {
      console.error('Missing required fields:', { to, subject, html: !!html });
      throw new Error('Missing required fields: to, subject, and html are required');
    }

    // Get SMTP settings for the user
    const { data: smtpSettings, error: settingsError } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !smtpSettings) {
      console.error('SMTP settings error:', settingsError);
      throw new Error('SMTP settings not found. Please configure your SMTP settings first.');
    }

    console.log('Retrieved SMTP settings for user:', user.id);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid recipient email address format');
    }

    try {
      // Create SMTP client with proper SSL/TLS configuration
      const client = new SMTPClient({
        connection: {
          hostname: smtpSettings.host,
          port: smtpSettings.port,
          tls: smtpSettings.secure,
          auth: {
            username: smtpSettings.username,
            password: smtpSettings.password,
          },
          // Add specific TLS options
          tlsOptions: {
            rejectUnauthorized: false // Only for development/testing
          }
        },
      });

      console.log('Attempting to send email to:', to);

      // Format the HTML content properly
      const formattedHtml = formatEmailContent(html);
      console.log('Formatted email content:', formattedHtml);

      // Send email with content-type headers
      const emailResult = await client.send({
        from: `${smtpSettings.from_name} <${smtpSettings.from_email}>`,
        to: to,
        subject: subject,
        content: formattedHtml,
        html: formattedHtml,
        headers: {
          "Content-Type": "text/html; charset=UTF-8"
        }
      });

      console.log('Email sent successfully:', emailResult);

      // Close connection
      await client.close();

      // If this was sent to a lead, create a message record
      if (lead_id) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            lead_id: lead_id,
            user_id: user.id,
            content: html,
            subject: subject,
            type: 'email',
            metadata: { 
              to, 
              from: smtpSettings.from_email 
            }
          });

        if (messageError) {
          console.error('Error saving message record:', messageError);
          // Don't throw here as the email was sent successfully
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Email sent successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (smtpError) {
      console.error('SMTP Error:', smtpError);
      throw new Error(`SMTP Error: ${smtpError.message}`);
    }

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred while sending the email' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
