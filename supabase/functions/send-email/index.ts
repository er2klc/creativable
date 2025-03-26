
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "npm:emailjs@4.0.1";
import { corsHeaders } from "../_shared/cors.ts";

interface EmailRequest {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  use_saved_settings?: boolean;
  smtp_config?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from_email: string;
    from_name?: string;
  };
  reply_to?: string;
  attachments?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailRequest = await req.json();
    console.log("Send email request received");

    // Validate required fields
    if (!requestData.to || !requestData.subject || (!requestData.text && !requestData.html)) {
      throw new Error("Missing required fields: to, subject, and either text or html body");
    }

    // Get user information from JWT if using saved settings
    let smtpConfig;
    if (requestData.use_saved_settings) {
      const authHeader = req.headers.get('authorization') || '';
      const jwt = authHeader.replace('Bearer ', '');

      if (!jwt) {
        throw new Error("Authentication required to use saved settings");
      }

      const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
      
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase environment variables");
      }

      // Get user ID from JWT
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        },
      });

      const userData = await userResponse.json();
      if (!userData.id) {
        throw new Error("Failed to get user information");
      }

      // Fetch SMTP settings for the user
      const smtpSettingsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/smtp_settings?user_id=eq.${userData.id}&select=*`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
          },
        }
      );

      const savedSettings = await smtpSettingsResponse.json();
      
      if (!savedSettings || savedSettings.length === 0) {
        throw new Error("No SMTP settings found for this user");
      }
      
      const settings = savedSettings[0];
      smtpConfig = {
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        user: settings.username,
        password: settings.password,
        from_email: settings.from_email,
        from_name: settings.from_name
      };
    } else if (requestData.smtp_config) {
      smtpConfig = requestData.smtp_config;
    } else {
      throw new Error("Either use_saved_settings must be true or smtp_config must be provided");
    }

    // Configure SMTP client
    const client = new SMTPClient({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    // Build email message
    const message: any = {
      from: smtpConfig.from_name 
        ? `${smtpConfig.from_name} <${smtpConfig.from_email}>`
        : smtpConfig.from_email,
      to: requestData.to,
      subject: requestData.subject
    };

    if (requestData.text) message.text = requestData.text;
    if (requestData.html) message.html = requestData.html;
    if (requestData.cc) message.cc = requestData.cc.join(',');
    if (requestData.bcc) message.bcc = requestData.bcc.join(',');
    if (requestData.reply_to) message.replyTo = requestData.reply_to;
    if (requestData.attachments) message.attachments = requestData.attachments;

    // Send email
    const info = await client.sendAsync(message);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        messageId: info.id,
        details: info
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Send email error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to send email",
        error: error.message,
        details: error.stack || "Unknown error"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200, // Return 200 even on error to get details on frontend
      }
    );
  }
});
