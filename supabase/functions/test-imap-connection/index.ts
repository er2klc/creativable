
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { ImapFlow } from 'npm:imapflow@1.0.98';

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

    const { host, port, username, password, connection_type = 'SSL/TLS', connection_timeout = 120000 } = await req.json();

    // Validate required fields
    if (!host || !port || !username || !password) {
      throw new Error('Missing required fields');
    }

    console.log(`Testing IMAP connection to ${host}:${port} with security: ${connection_type}`);
    
    // Determine secure settings based on connection type
    const secure = connection_type === 'SSL/TLS';
    const requireTLS = connection_type === 'STARTTLS';
    
    // Configure TLS options for better compatibility
    const tlsOptions = {
      rejectUnauthorized: false, // This allows self-signed certs
      minVersion: 'TLSv1',       // Support older TLS versions for compatibility
    };
    
    // Create IMAP client with proper settings
    const client = new ImapFlow({
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password
      },
      requireTLS,
      logger: false,
      timeoutConnection: connection_timeout,
      tls: tlsOptions
    });

    // Try to connect to verify settings
    try {
      await client.connect();
      
      // Get mailbox list to verify access
      const mailboxes = await client.listMailboxes();
      
      console.log('Connection successful!');
      console.log(`Found ${mailboxes.length} mailboxes`);
      
      // Close connection
      await client.logout();
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Erfolgreich mit ${host} verbunden! ${mailboxes.length} E-Mail-Ordner gefunden.`,
          mailboxCount: mailboxes.length
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    } catch (error) {
      console.error('Connection error:', error);
      let errorMessage = 'Verbindungsfehler';
      
      // Provide more helpful error messages
      if (error.code === 'ECONNREFUSED') {
        errorMessage = `Verbindung abgelehnt: Prüfen Sie Host und Port (${host}:${port})`;
      } else if (error.code === 'ETIMEDOUT' || error.code === 'TIMEOUT') {
        errorMessage = `Zeitüberschreitung bei der Verbindung: Prüfen Sie Ihre Netzwerkverbindung und Firewall`;
      } else if (error.code === 'AUTHENTICATIONFAILED') {
        errorMessage = `Authentifizierung fehlgeschlagen: Benutzername oder Passwort falsch`;
      } else if (error.code === 'UPGRADE_TIMEOUT') {
        errorMessage = `SSL/TLS Aufbau fehlgeschlagen: Versuchen Sie einen anderen Verbindungstyp`;
      } else if (error.code === 'STARTTLS') {
        errorMessage = `STARTTLS fehlgeschlagen: Server unterstützt STARTTLS möglicherweise nicht`;
      } else {
        errorMessage = `Fehler: ${error.message || error}`;
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
