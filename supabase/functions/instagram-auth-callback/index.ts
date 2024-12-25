import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();
    
    console.log('Received request with code and redirect URI:', { 
      codePresent: !!code,
      redirectUri 
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's Instagram credentials from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('User not found');
    }

    console.log('Exchanging code for access token...');

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '1315021952869619',
        client_secret: Deno.env.get('INSTAGRAM_APP_SECRET') || '',
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const responseText = await tokenResponse.text();
    console.log('Raw token response:', responseText);

    if (!tokenResponse.ok) {
      console.error('Instagram token exchange error:', responseText);
      throw new Error(`Failed to exchange code for access token: ${responseText}`);
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing token response:', e);
      throw new Error('Invalid JSON response from Instagram');
    }

    console.log('Instagram token data:', tokenData);

    if (!tokenData.access_token) {
      throw new Error('No access token received');
    }

    return new Response(JSON.stringify(tokenData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in instagram-auth-callback:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});