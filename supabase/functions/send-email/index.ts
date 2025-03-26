
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "npm:emailjs@3.2.1";
import { corsHeaders } from "../_shared/cors.ts";

interface SendEmailRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: {
    name: string;
    data: string; // Base64 encoded
    contentType: string;
  }[];
  lead_id?: string;
  reply_to_message_id?: string;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
  details?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData: SendEmailRequest = await req.json();
    console.log("Send email request received");

    // Validate required fields
    if (!requestData.to || !requestData.subject || (!requestData.text && !requestData.html)) {
      throw new Error("Missing required fields: to, subject, and either text or html body");
    }

    // Get the user's JWT from the request
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');

    if (!jwt) {
      throw new Error("Authentication required");
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    // Get user information from the token
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

    const userId = userData.id;

    // Fetch SMTP settings for the user
    const smtpSettingsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/smtp_settings?user_id=eq.${userId}&select=*`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    );

    const smtpSettings = await smtpSettingsResponse.json();
    
    if (!smtpSettings || smtpSettings.length === 0) {
      throw new Error("No SMTP settings found for this user");
    }

    const settings = smtpSettings[0];

    // Configure SMTP client
    const client = new SMTPClient({
      user: settings.username,
      password: settings.password,
      host: settings.host,
      port: settings.port,
      ssl: settings.secure,
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    // Prepare email
    const message = {
      from: `${settings.from_name} <${settings.from_email}>`,
      to: requestData.to,
      subject: requestData.subject,
      text: requestData.text || '',
      attachment: [
        // Include HTML body if provided
        ...(requestData.html ? [{ data: requestData.html, alternative: true }] : []),
        
        // Include attachments if provided
        ...(requestData.attachments || []).map(attachment => ({
          name: attachment.name,
          data: Uint8Array.from(atob(attachment.data), c => c.charCodeAt(0)),
          type: attachment.contentType
        }))
      ]
    };

    // Add CC and BCC if provided
    if (requestData.cc && requestData.cc.length > 0) {
      message['cc'] = requestData.cc.join(', ');
    }
    
    if (requestData.bcc && requestData.bcc.length > 0) {
      message['bcc'] = requestData.bcc.join(', ');
    }

    // Add In-Reply-To header if this is a reply
    if (requestData.reply_to_message_id) {
      message['headers'] = {
        'In-Reply-To': requestData.reply_to_message_id
      };
    }

    // Send the email
    console.log("Sending email to:", requestData.to);
    const info = await client.sendAsync(message);
    console.log("Email sent successfully:", info);

    // Store the sent email in the database
    try {
      const emailData = {
        user_id: userId,
        folder: 'Sent', // Store in Sent folder
        message_id: info.header['message-id'],
        subject: requestData.subject,
        from_name: settings.from_name,
        from_email: settings.from_email,
        to_name: '', // We don't know recipient's name
        to_email: requestData.to,
        cc: requestData.cc || [],
        bcc: requestData.bcc || [],
        html_content: requestData.html || null,
        text_content: requestData.text || null,
        sent_at: new Date().toISOString(),
        received_at: new Date().toISOString(),
        read: true, // Mark as read since it's our own email
        lead_id: requestData.lead_id || null,
        has_attachments: requestData.attachments && requestData.attachments.length > 0,
        direction: 'outbound'
      };

      const storeResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/emails`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify(emailData)
        }
      );

      if (!storeResponse.ok) {
        console.error("Failed to store sent email:", await storeResponse.text());
      }
    } catch (storeError) {
      console.error("Error storing sent email:", storeError);
      // Continue even if storing fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        messageId: info.header['message-id']
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
