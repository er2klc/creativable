
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded content
    contentType?: string;
  }>;
  lead_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client using the environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body
    const { 
      to, 
      subject, 
      html, 
      text, 
      cc, 
      bcc, 
      attachments,
      lead_id 
    } = await req.json() as EmailRequest;

    // Get authentication info
    const authHeader = req.headers.get('Authorization');
    let user_id;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) {
        console.error("Auth error:", error);
        return new Response(
          JSON.stringify({ error: "Authentication error", details: error.message }),
          { 
            status: 401, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      }
      
      user_id = user?.id;
    } else {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Get SMTP settings from the database
    const { data: smtpSettings, error: smtpError } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    if (smtpError || !smtpSettings) {
      console.error("SMTP settings error:", smtpError);
      return new Response(
        JSON.stringify({ 
          error: "SMTP settings not found", 
          details: "Please configure your SMTP settings first" 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Create SMTP client with stored settings
    const client = new SMTPClient({
      connection: {
        hostname: smtpSettings.host,
        port: smtpSettings.port,
        tls: smtpSettings.secure,
        auth: {
          username: smtpSettings.username,
          password: smtpSettings.password,
        },
      },
    });

    // Prepare attachments if any
    const parsedAttachments = attachments?.map(attachment => ({
      content: Uint8Array.from(atob(attachment.content), c => c.charCodeAt(0)),
      filename: attachment.filename,
      contentType: attachment.contentType || 'application/octet-stream',
    })) || [];

    // Send the email
    const emailResult = await client.send({
      from: `${smtpSettings.from_name} <${smtpSettings.from_email}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || undefined,
      cc: cc || undefined,
      bcc: bcc || undefined,
      attachments: parsedAttachments,
    });

    // Close the connection
    await client.close();
    
    // Record the email in the database
    const { data: emailRecord, error: recordError } = await supabase
      .from('email_tracking')
      .insert({
        user_id: user_id,
        to_email: to,
        subject: subject,
        content: html,
        lead_id: lead_id || null,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (recordError) {
      console.error("Error recording email:", recordError);
      // We still consider this a success since the email was sent
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully", 
        email_id: emailRecord?.id 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
