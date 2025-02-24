
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmtpTestConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { host, port, username, password, secure, user_id } = await req.json() as SmtpTestConfig;

    // Validiere die Eingabeparameter
    if (!host || !port || !username || !password || typeof secure !== 'boolean' || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Erstelle SMTP Client
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: port,
        tls: secure,
        auth: {
          username: username,
          password: password,
        },
      },
    });

    // Versuche eine Verbindung herzustellen
    try {
      await client.connect();
      await client.close();

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('SMTP connection error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'SMTP connection failed',
          details: error.message 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
