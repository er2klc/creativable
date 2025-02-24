
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { host, port, username, password, secure, user_id } = await req.json();

    // Validate the input parameters
    if (!host || !port || !username || !password || typeof secure !== 'boolean' || !user_id) {
      console.error('Missing or invalid parameters:', { host, port, username, secure, user_id });
      return new Response(
        JSON.stringify({ 
          error: 'Missing or invalid parameters. Please provide all required fields.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create SMTP client with proper SSL/TLS configuration
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: port,
        tls: secure,
        auth: {
          username: username,
          password: password,
        },
        tlsOptions: {
          rejectUnauthorized: false // Only for development/testing
        }
      },
    });

    // Test connection by attempting to connect
    console.log('Testing SMTP connection to:', host);
    try {
      await client.connect();
      console.log('SMTP connection successful');
      await client.close();

      return new Response(
        JSON.stringify({ success: true, message: 'SMTP connection successful' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (smtpError) {
      console.error('SMTP connection error:', smtpError);
      return new Response(
        JSON.stringify({ 
          error: 'SMTP connection failed',
          details: smtpError.message 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in test-smtp-connection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
