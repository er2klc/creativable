
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import nodemailer from 'npm:nodemailer@6.9.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get user from auth header
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { 
      host, 
      port, 
      username, 
      password, 
      from_email,
      connection_type = 'STARTTLS',  
      connection_timeout = 60000
    } = await req.json();

    // Validate required fields
    if (!host || !port || !username || !password) {
      throw new Error('Missing required fields');
    }

    console.log(`Testing SMTP connection to ${host}:${port} with security: ${connection_type}`);
    
    // Determine secure settings based on connection type
    const secure = connection_type === 'SSL/TLS';
    
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure, // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
      connectionTimeout: connection_timeout,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certs
      }
    });

    // Verify the connection
    await transporter.verify();
    
    // Store successful verification in database
    if (user) {
      const { error } = await supabaseClient
        .from('smtp_settings')
        .upsert({
          user_id: user.id,
          host,
          port,
          username,
          password,
          from_email: from_email || username,
          connection_type,
          secure,
          is_verified: true,
          last_verified_at: new Date().toISOString(),
          last_verification_status: 'success'
        }, { onConflict: 'user_id' });
        
      if (error) {
        console.warn('Error updating SMTP verification status:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMTP-Verbindung erfolgreich hergestellt!'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error(error.message);
    
    // Generate helpful error message
    let errorMessage = 'SMTP-Verbindungsfehler';
    
    if (error.message.includes('getaddrinfo')) {
      errorMessage = 'Server nicht gefunden: Prüfen Sie die Serveradresse';
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Verbindung abgelehnt: Prüfen Sie Host und Port';
    } else if (error.message.includes('ETIMEDOUT')) {
      errorMessage = 'Zeitüberschreitung bei der Verbindung: Prüfen Sie Ihre Netzwerkverbindung';
    } else if (error.message.includes('535')) {
      errorMessage = 'Authentifizierung fehlgeschlagen: Benutzername oder Passwort falsch';
    } else if (error.message.includes('STARTTLS')) {
      errorMessage = 'STARTTLS fehlgeschlagen: Server unterstützt STARTTLS möglicherweise nicht';
    } else {
      errorMessage = `Fehler: ${error.message}`;
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
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
});
