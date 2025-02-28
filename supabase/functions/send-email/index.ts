
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Initialize Supabase client with env variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Get SMTP settings from database
    const { data: smtpSettings, error: smtpError } = await supabase
      .from("smtp_settings")
      .select("*")
      .single();

    if (smtpError || !smtpSettings) {
      console.error("Failed to retrieve SMTP settings:", smtpError);
      return new Response(
        JSON.stringify({ error: "SMTP settings not found" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    // Extract the authenticated user from the request
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        console.warn("Failed to get user from token:", error);
      }
    }
    
    if (!userId) {
      console.warn("No authenticated user found, trying to extract from JWT claims");
      try {
        // Try to extract from JWT claims if using supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch (error) {
        console.warn("Failed to extract user from claims:", error);
      }
    }

    console.log("Authenticated user ID:", userId);

    // Configure SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpSettings.smtp_host,
        port: smtpSettings.smtp_port,
        tls: smtpSettings.smtp_secure,
        auth: {
          username: smtpSettings.smtp_user,
          password: smtpSettings.smtp_password,
        },
      },
    });

    // Prepare email
    const emailMessage = {
      from: smtpSettings.from_email,
      to: requestData.to,
      subject: requestData.subject,
      content: requestData.html,
      html: requestData.html,
    };

    console.log("Sending email via SMTP to:", requestData.to);
    console.log("Using SMTP server:", smtpSettings.smtp_host, "port:", smtpSettings.smtp_port);
    
    // Send email
    try {
      const sendResult = await client.send(emailMessage);
      console.log("Email sent successfully:", sendResult);
      
      // Log to email_tracking table if lead_id is provided
      if (requestData.lead_id && userId) {
        try {
          const { error: trackingError } = await supabase
            .from("email_tracking")
            .insert({
              user_id: userId,
              to_email: requestData.to,
              subject: requestData.subject,
              content: requestData.html,
              lead_id: requestData.lead_id,
              status: "sent",
              sent_at: new Date().toISOString(),
            });

          if (trackingError) {
            console.warn("Failed to insert email tracking record:", trackingError);
          }
        } catch (trackingError) {
          console.warn("Error tracking email:", trackingError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully"
        }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    } catch (smtpError) {
      console.error("SMTP Error:", smtpError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email", 
          details: smtpError instanceof Error ? smtpError.message : String(smtpError)
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    } finally {
      // Always close the connection
      try {
        await client.close();
      } catch (e) {
        console.warn("Error closing SMTP connection:", e);
      }
    }
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
