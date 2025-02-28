
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Initialize Supabase client with env variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
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

// Helper function to detect SMTP errors and provide clear error messages
function getDetailedSmtpErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Connection issues
  if (errorMessage.includes("connection refused") || errorMessage.includes("ECONNREFUSED") || 
      errorMessage.includes("connect failed") || errorMessage.includes("network error")) {
    return "Verbindung zum SMTP-Server fehlgeschlagen. Bitte überprüfen Sie die Server-Adresse und den Port.";
  }
  
  // Authentication issues
  if (errorMessage.includes("535") || errorMessage.includes("535 5.7.8") ||
      errorMessage.includes("authentication failed") || errorMessage.includes("invalid credentials") ||
      errorMessage.includes("Bad username or password")) {
    return "SMTP-Authentifizierung fehlgeschlagen. Bitte überprüfen Sie Benutzername und Passwort.";
  }
  
  // SSL/TLS issues
  if (errorMessage.includes("SSL") || errorMessage.includes("TLS") || 
      errorMessage.includes("certificate") || errorMessage.includes("secure connection")) {
    return "SSL/TLS-Verbindungsfehler. Bitte prüfen Sie die SSL/TLS-Einstellungen oder versuchen Sie, SSL zu deaktivieren.";
  }
  
  // Rate limiting or spam detection
  if (errorMessage.includes("rate limit") || errorMessage.includes("too many") ||
      errorMessage.includes("spam") || errorMessage.includes("550")) {
    return "E-Mail wurde nicht akzeptiert. Mögliche Gründe: Rate-Limit überschritten oder Spam-Verdacht.";
  }
  
  // Default case
  return `E-Mail-Versand fehlgeschlagen: ${errorMessage}`;
}

serve(async (req) => {
  console.log("Email service function called", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Parse request body
    const requestData = await req.json() as EmailRequest;
    console.log("Request data received:", JSON.stringify({
      to: requestData.to,
      subject: requestData.subject,
      hasHtml: Boolean(requestData.html),
      hasAttachments: Boolean(requestData.attachments?.length),
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

    // Validate SMTP settings
    if (!smtpSettings.smtp_host || !smtpSettings.smtp_port || !smtpSettings.smtp_user || !smtpSettings.smtp_password) {
      console.error("Incomplete SMTP settings");
      return new Response(
        JSON.stringify({ error: "Incomplete SMTP settings. Please check your email configuration." }),
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
    console.log("Configuring SMTP client with settings:", {
      host: smtpSettings.smtp_host,
      port: smtpSettings.smtp_port,
      secure: smtpSettings.smtp_secure,
      user: smtpSettings.smtp_user ? "***" : undefined,
      fromEmail: smtpSettings.from_email
    });

    try {
      // Create SMTP client
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

      // Prepare email with fallback plain text
      const htmlContent = requestData.html;
      // Simple conversion of HTML to plain text
      const plainText = htmlContent.replace(/<[^>]*>/g, '');

      // Send email
      console.log("Sending email via SMTP to:", requestData.to);
      await client.send({
        from: smtpSettings.from_email,
        to: requestData.to,
        subject: requestData.subject,
        content: requestData.text || plainText,
        html: htmlContent,
      });
      
      // Close connection
      await client.close();
      console.log("Email sent successfully");
      
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
      
      // Get detailed error message
      const detailedError = getDetailedSmtpErrorMessage(smtpError);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email", 
          details: detailedError
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
