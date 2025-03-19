
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "npm:emailjs@4.0.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { to, cc, bcc, subject, text_content, html_content, attachments, in_reply_to } = await req.json();
    
    if (!to || !subject) {
      throw new Error("Missing required fields: to, subject");
    }
    
    // Validate recipients are arrays
    const toAddresses = Array.isArray(to) ? to : [to];
    const ccAddresses = cc || [];
    const bccAddresses = bcc || [];
    
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
    
    // Get the SMTP settings
    const smtpResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/smtp_settings?user_id=eq.${userData.id}&select=*`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    );
    
    if (!smtpResponse.ok) {
      throw new Error("Failed to fetch SMTP settings");
    }
    
    const smtpSettings = await smtpResponse.json();
    
    if (!smtpSettings || smtpSettings.length === 0) {
      throw new Error("No SMTP settings found for this user");
    }
    
    const settings = smtpSettings[0];
    
    // Initialize SMTP client
    const client = new SMTPClient({
      user: settings.username,
      password: settings.password,
      host: settings.host,
      port: settings.port,
      ssl: settings.secure,
      tls: !settings.secure ? undefined : {
        rejectUnauthorized: false
      }
    });
    
    // Format email addresses properly
    const formatAddresses = (addresses) => {
      if (!addresses || addresses.length === 0) return undefined;
      return addresses.join(', ');
    };
    
    // Create message ID for tracking
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 15)}@${settings.host}>`;
    
    // Send the email
    const message = {
      from: settings.from_email,
      to: formatAddresses(toAddresses),
      cc: formatAddresses(ccAddresses),
      bcc: formatAddresses(bccAddresses),
      subject,
      text: text_content || html_content?.replace(/<[^>]*>/g, ''),
      attachment: [
        { data: html_content, alternative: true }
      ],
      'message-id': messageId,
      ...(in_reply_to && { 'in-reply-to': in_reply_to })
    };
    
    // Add any file attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        try {
          const response = await fetch(attachment.url);
          if (!response.ok) throw new Error(`Failed to fetch attachment: ${attachment.name}`);
          
          const fileData = await response.arrayBuffer();
          
          message.attachment.push({
            name: attachment.name,
            type: attachment.type,
            data: fileData
          });
        } catch (attachError) {
          console.error(`Error adding attachment ${attachment.name}:`, attachError);
          // Continue with other attachments even if one fails
        }
      }
    }
    
    // Send the email
    const result = await client.sendAsync(message);
    
    console.log("Email sent successfully:", result);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        message_id: messageId,
        result
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error sending email:", error);
    
    let errorMessage = error.message || "An unknown error occurred";
    if (error.message.includes("EAUTH")) {
      errorMessage = "SMTP authentication failed. Please check your credentials.";
    } else if (error.message.includes("ESOCKET") || error.message.includes("ECONNECTION")) {
      errorMessage = "Could not connect to SMTP server. Please check your connection settings.";
    } else if (error.message.includes("ETLS")) {
      errorMessage = "TLS/SSL error. Try changing the secure setting.";
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: error.stack || "No details available"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 400,
      }
    );
  }
});
