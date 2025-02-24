
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  lead_id?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get("Authorization")?.split(" ")[1] ?? ""
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get SMTP settings for the user
    const { data: smtpSettings, error: smtpError } = await supabaseClient
      .from("smtp_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (smtpError || !smtpSettings) {
      throw new Error("SMTP settings not found");
    }

    const payload: EmailPayload = await req.json();

    // Create mail transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.secure,
      auth: {
        user: smtpSettings.username,
        pass: smtpSettings.password,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"${smtpSettings.from_name}" <${smtpSettings.from_email}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
    });

    // Save email record
    const { error: emailError } = await supabaseClient
      .from("emails")
      .insert([
        {
          user_id: user.id,
          lead_id: payload.lead_id,
          subject: payload.subject,
          body: payload.html,
          from_email: smtpSettings.from_email,
          to_email: payload.to,
          direction: "outgoing",
          status: "sent",
          sent_at: new Date().toISOString(),
        },
      ]);

    if (emailError) {
      console.error("Error saving email record:", emailError);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
