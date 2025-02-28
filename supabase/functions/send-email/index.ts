
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
function getDetailedSmtpErrorMessage(error: unknown): { 
  userMessage: string;
  technicalDetails: string;
  errorCode?: string;
  errorCategory: 'connection' | 'authentication' | 'tls' | 'rate_limit' | 'recipient' | 'unknown';
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Extract technical details for debugging
  const technicalDetails = errorMessage;
  
  // Default values
  let userMessage = "E-Mail konnte nicht gesendet werden. Bitte prüfen Sie die SMTP-Einstellungen.";
  let errorCategory: 'connection' | 'authentication' | 'tls' | 'rate_limit' | 'recipient' | 'unknown' = 'unknown';
  let errorCode: string | undefined = undefined;
  
  // Try to extract error code if it exists
  const errorCodeMatch = errorMessage.match(/(\d{3})/);
  if (errorCodeMatch) {
    errorCode = errorCodeMatch[1];
  }
  
  // Connection issues
  if (errorMessage.includes("connection refused") || 
      errorMessage.includes("ECONNREFUSED") || 
      errorMessage.includes("connect failed") || 
      errorMessage.includes("network error") ||
      errorMessage.includes("Connection timed out") ||
      errorMessage.includes("getaddrinfo")) {
    userMessage = "Verbindung zum SMTP-Server fehlgeschlagen. Bitte überprüfen Sie die Server-Adresse und den Port.";
    errorCategory = 'connection';
  }
  
  // Authentication issues
  else if (errorMessage.includes("535") || 
           errorMessage.includes("535 5.7.8") ||
           errorMessage.includes("authentication failed") || 
           errorMessage.includes("invalid credentials") ||
           errorMessage.includes("Bad username or password")) {
    userMessage = "SMTP-Authentifizierung fehlgeschlagen. Bitte überprüfen Sie Benutzername und Passwort.";
    errorCategory = 'authentication';
  }
  
  // SSL/TLS issues
  else if (errorMessage.includes("SSL") || 
           errorMessage.includes("TLS") || 
           errorMessage.includes("certificate") || 
           errorMessage.includes("secure connection")) {
    userMessage = "SSL/TLS-Verbindungsfehler. Bitte prüfen Sie die SSL/TLS-Einstellungen oder versuchen Sie, SSL zu deaktivieren.";
    errorCategory = 'tls';
  }
  
  // Rate limiting or spam detection
  else if (errorMessage.includes("rate limit") || 
           errorMessage.includes("too many") ||
           errorMessage.includes("spam") || 
           errorMessage.includes("550")) {
    userMessage = "E-Mail wurde vom Server abgelehnt. Mögliche Gründe: Rate-Limit überschritten oder Spam-Verdacht.";
    errorCategory = 'rate_limit';
  }
  
  // Recipient issues
  else if (errorMessage.includes("recipient") || 
           errorMessage.includes("mailbox") ||
           errorMessage.includes("no such user") || 
           errorMessage.includes("550 5.1.1")) {
    userMessage = "E-Mail-Adresse des Empfängers wurde nicht akzeptiert. Bitte prüfen Sie die E-Mail-Adresse.";
    errorCategory = 'recipient';
  }
  
  return {
    userMessage,
    technicalDetails,
    errorCode,
    errorCategory
  };
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
        JSON.stringify({ 
          error: "Missing required fields", 
          details: `Required fields: ${!requestData.to ? 'to, ' : ''}${!requestData.subject ? 'subject, ' : ''}${!requestData.html ? 'html' : ''}` 
        }),
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
    console.log("Fetching SMTP settings from database");
    const { data: smtpSettings, error: smtpError } = await supabase
      .from("smtp_settings")
      .select("*")
      .single();

    if (smtpError) {
      console.error("Failed to retrieve SMTP settings:", smtpError);
      return new Response(
        JSON.stringify({ 
          error: "SMTP Einstellungen konnten nicht abgerufen werden", 
          details: smtpError.message,
          code: smtpError.code 
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

    if (!smtpSettings) {
      console.error("No SMTP settings found");
      return new Response(
        JSON.stringify({ 
          error: "SMTP-Einstellungen nicht gefunden", 
          details: "Bitte konfigurieren Sie Ihre E-Mail-Einstellungen im Einstellungsbereich." 
        }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    // Validate SMTP settings
    const missingFields = [];
    if (!smtpSettings.smtp_host) missingFields.push("SMTP-Server");
    if (!smtpSettings.smtp_port) missingFields.push("SMTP-Port");
    if (!smtpSettings.smtp_user) missingFields.push("SMTP-Benutzername");
    if (!smtpSettings.smtp_password) missingFields.push("SMTP-Passwort");
    if (!smtpSettings.from_email) missingFields.push("Absender-E-Mail");

    if (missingFields.length > 0) {
      console.error("Incomplete SMTP settings:", missingFields);
      return new Response(
        JSON.stringify({ 
          error: "Unvollständige SMTP-Einstellungen", 
          details: `Folgende Einstellungen fehlen: ${missingFields.join(", ")}` 
        }),
        { 
          status: 400, 
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
      // Create SMTP client with proper debug logging
      console.log("Creating SMTP client...");
      const client = new SMTPClient({
        connection: {
          hostname: smtpSettings.smtp_host,
          port: smtpSettings.smtp_port,
          tls: smtpSettings.smtp_secure,
          auth: {
            username: smtpSettings.smtp_user,
            password: smtpSettings.smtp_password,
          },
          // Set a reasonable timeout
          timeout: 10000,
        },
      });

      // Prepare email with fallback plain text
      const htmlContent = requestData.html;
      // Simple conversion of HTML to plain text
      const plainText = requestData.text || htmlContent.replace(/<[^>]*>/g, '');

      // Send email
      console.log("Connecting to SMTP server...");
      await client.connect();
      console.log("Connected to SMTP server successfully");
      
      console.log("Sending email via SMTP to:", requestData.to);
      const sendResult = await client.send({
        from: smtpSettings.from_email,
        to: requestData.to,
        subject: requestData.subject,
        content: plainText,
        html: htmlContent,
      });
      
      console.log("Send command completed with result:", sendResult);
      
      // Close connection
      console.log("Closing SMTP connection...");
      await client.close();
      console.log("Email sent successfully and connection closed");
      
      // Log to email_tracking table if lead_id is provided
      if (requestData.lead_id && userId) {
        try {
          console.log("Logging email to tracking table for lead:", requestData.lead_id);
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
          } else {
            console.log("Email tracking record created successfully");
          }
        } catch (trackingError) {
          console.warn("Error tracking email:", trackingError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "E-Mail erfolgreich gesendet" 
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
      
      // Get detailed error information
      const errorInfo = getDetailedSmtpErrorMessage(smtpError);
      
      // Log the error details for debugging
      console.error("Detailed SMTP error:", {
        message: errorInfo.userMessage,
        technicalDetails: errorInfo.technicalDetails,
        errorCode: errorInfo.errorCode,
        category: errorInfo.errorCategory
      });
      
      return new Response(
        JSON.stringify({ 
          error: "E-Mail konnte nicht gesendet werden", 
          message: errorInfo.userMessage,
          details: errorInfo.technicalDetails,
          errorCode: errorInfo.errorCode,
          errorCategory: errorInfo.errorCategory
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
        error: "Fehler beim E-Mail-Versand", 
        details: error instanceof Error ? error.message : "Unbekannter Fehler"
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
