
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  lead_id?: string;
}

serve(async (req) => {
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
      throw new Error('Unauthorized');
    }

    // Get SMTP settings for the user
    const { data: smtpSettings, error: settingsError } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !smtpSettings) {
      throw new Error('SMTP settings not found');
    }

    const { to, subject, html, lead_id }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email address');
    }

    // Create SMTP client
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

    // Send email
    await client.send({
      from: `${smtpSettings.from_name} <${smtpSettings.from_email}>`,
      to: to,
      subject: subject,
      html: html,
    });

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
          metadata: { to, from: smtpSettings.from_email }
        });

      if (messageError) {
        console.error('Error saving message:', messageError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while sending the email' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
