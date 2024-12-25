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
    
    console.log('Instagram Callback - Starting token exchange process');
    console.log('Received parameters:', { 
      codePresent: !!code,
      redirectUri,
      timestamp: new Date().toISOString()
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's Instagram credentials from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('User authentication error:', userError);
      throw userError;
    }
    
    if (!user) {
      console.error('No user found in auth context');
      throw new Error('User not found');
    }

    console.log('User authenticated successfully:', { userId: user.id });

    // Exchange code for access token
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';
    console.log('Preparing token exchange request to:', tokenUrl);

    // Ensure the redirect URI matches exactly what's registered with Instagram
    const cleanRedirectUri = redirectUri.split('#')[0].split('?')[0];
    console.log('Using cleaned redirect URI:', cleanRedirectUri);

    const formData = new URLSearchParams({
      client_id: '1315021952869619',
      client_secret: Deno.env.get('INSTAGRAM_APP_SECRET') || '',
      grant_type: 'authorization_code',
      redirect_uri: cleanRedirectUri,
      code,
    });

    console.log('Token exchange request parameters:', {
      client_id: '1315021952869619',
      redirect_uri: cleanRedirectUri,
      code_length: code?.length,
      has_secret: !!Deno.env.get('INSTAGRAM_APP_SECRET')
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const responseText = await tokenResponse.text();
    console.log('Raw Instagram response:', responseText);

    if (!tokenResponse.ok) {
      console.error('Instagram token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: responseText
      });
      throw new Error(`Failed to exchange code for access token: ${responseText}`);
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
      console.log('Successfully parsed token data');
    } catch (e) {
      console.error('Failed to parse Instagram response:', e);
      throw new Error('Invalid JSON response from Instagram');
    }

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('No access token received');
    }

    console.log('Successfully received access token');

    // Update platform_auth_status with the new access token
    const { error: statusError } = await supabase
      .from('platform_auth_status')
      .upsert({
        user_id: user.id,
        platform: 'instagram',
        is_connected: true,
        access_token: tokenData.access_token,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      });

    if (statusError) {
      console.error('Failed to update platform auth status:', statusError);
      throw statusError;
    }

    console.log('Successfully updated platform auth status');

    return new Response(JSON.stringify(tokenData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Instagram auth callback error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});