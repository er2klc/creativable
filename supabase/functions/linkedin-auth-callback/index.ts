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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const error_description = url.searchParams.get('error_description');

    console.log('Received callback with params:', { code, state, error, error_description });

    if (error || error_description) {
      console.error('LinkedIn OAuth error:', { error, error_description });
      throw new Error(`LinkedIn OAuth error: ${error_description || error}`);
    }

    if (!code) {
      console.error('No code parameter received');
      throw new Error('No authorization code received');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header present');
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('User auth error:', authError);
      throw new Error('Invalid authorization token');
    }

    console.log('Getting LinkedIn credentials...');

    // Get LinkedIn credentials from platform_auth_status
    const { data: platformAuth, error: credentialsError } = await supabaseClient
      .from('platform_auth_status')
      .select('auth_token, refresh_token')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .single();

    if (credentialsError || !platformAuth) {
      console.error('LinkedIn credentials error:', credentialsError);
      throw new Error('LinkedIn credentials not found. Please save your LinkedIn Client ID and Secret first.');
    }

    const clientId = platformAuth.auth_token;
    const clientSecret = platformAuth.refresh_token;
    const redirectUri = `${url.origin}/auth/callback/linkedin`;

    console.log('Exchanging code for token...');

    // Exchange code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed. Status:', tokenResponse.status, 'Response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error_description: errorText };
      }
      throw new Error(`Failed to exchange code for token: ${errorData.error_description || 'Unknown error'}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');

    // Get user profile using OpenID Connect userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch failed. Status:', profileResponse.status, 'Response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(`Failed to fetch profile: ${errorData.error || 'Unknown error'}`);
    }

    const profileData = await profileResponse.json();
    console.log('Successfully fetched user profile');

    // Update platform_auth_status
    const { error: updateError } = await supabaseClient
      .from('platform_auth_status')
      .upsert({
        user_id: user.id,
        platform: 'linkedin',
        auth_token: clientId,
        refresh_token: clientSecret,
        access_token: tokenData.access_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        is_connected: true,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating platform auth status:', updateError);
      throw new Error('Failed to update connection status');
    }

    // Update settings table
    const { error: settingsError } = await supabaseClient
      .from('settings')
      .update({ linkedin_connected: true })
      .eq('user_id', user.id);

    if (settingsError) {
      console.error('Error updating settings:', settingsError);
      // Don't throw here as the main connection is already established
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in LinkedIn callback:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});