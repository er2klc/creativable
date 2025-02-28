
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Initialize Supabase client with env variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend with API key from env variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  lead_id?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

serve(async (req) => {
  console.log("Email service function called", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json() as EmailRequest;
    console.log("Request data received:", JSON.stringify({
      to: requestData.to,
      subject: requestData.subject,
      hasHtml: !!requestData.html,
      hasAttachments: !!requestData.attachments?.length,
      lead_id: requestData.lead_id
    }));

    // Validate required fields
    if (!requestData.to || !requestData.subject || !requestData.html) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    // Get from_email from SMTP settings
    let fromEmail = "noreply@yourdomain.com"; // Default fallback
    let fromName = "Your App";
    
    try {
      const { data: smtpSettings, error } = await supabase
        .from("smtp_settings")
        .select("from_email, from_name")
        .single();
      
      if (!error && smtpSettings) {
        fromEmail = smtpSettings.from_email || fromEmail;
        fromName = smtpSettings.from_name || fromName;
        console.log(`Using from address: ${fromName} <${fromEmail}>`);
      } else {
        console.warn("Could not retrieve SMTP settings, using defaults", error);
      }
    } catch (error) {
      console.warn("Error retrieving SMTP settings:", error);
    }

    // Prepare email data for Resend
    const emailData = {
      from: `${fromName} <${fromEmail}>`,
      to: [requestData.to],
      subject: requestData.subject,
      html: requestData.html,
      text: requestData.text,
      attachments: requestData.attachments?.map(attachment => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64'),
        contentType: attachment.contentType || 'application/octet-stream'
      }))
    };

    console.log("Sending email via Resend to:", requestData.to);
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("Error from Resend API:", error);
      throw error;
    }

    console.log("Email sent successfully, ID:", data?.id);

    // Optional: Log email in database if lead_id is provided
    if (requestData.lead_id) {
      try {
        const { error: dbError } = await supabase
          .from("email_tracking")
          .insert({
            to_email: requestData.to,
            subject: requestData.subject,
            content: requestData.html,
            lead_id: requestData.lead_id,
            status: "sent",
            sent_at: new Date().toISOString(),
            tracking_id: data?.id,
          });
        
        if (dbError) {
          console.warn("Failed to log email to database:", dbError);
        }
      } catch (logError) {
        console.warn("Error logging email to database:", logError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully", 
        id: data?.id 
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Error sending email", 
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
