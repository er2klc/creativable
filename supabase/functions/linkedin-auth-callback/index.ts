import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    console.log('Getting LinkedIn credentials...');

    // Get LinkedIn credentials from platform_auth_status
    const { data: platformAuth, error: credentialsError } = await supabaseClient
      .from('platform_auth_status')
      .select('auth_token, refresh_token')
      .eq('platform', 'linkedin')
      .eq('user_id', user.id)
      .single();

    if (credentialsError || !platformAuth) {
      console.error('LinkedIn credentials error:', credentialsError);
      throw new Error('LinkedIn credentials not found. Please save your LinkedIn Client ID and Secret first.');
    }

    const clientId = platformAuth.auth_token;
    const clientSecret = platformAuth.refresh_token;

    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn credentials not configured. Please check your LinkedIn integration settings.');
    }

    console.log('Exchanging code for access token...');

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
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
      const errorData = await profileResponse.json();
      console.error('Profile fetch failed:', errorData);
      throw new Error('Failed to fetch profile');
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
      }, {
        onConflict: 'user_id,platform'
      });

    if (updateError) {
      console.error('Error updating platform_auth_status:', updateError);
      throw updateError;
    }

    // Update settings to mark LinkedIn as connected
    const { error: settingsError } = await supabaseClient
      .from('settings')
      .update({ 
        linkedin_connected: true,
        linkedin_auth_token: tokenData.access_token,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (settingsError) {
      console.error('Error updating settings:', settingsError);
      throw settingsError;
    }

    console.log('Successfully updated database records');

    return new Response(
      JSON.stringify({
        success: true,
        profile: profileData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.message.includes('LinkedIn credentials') ? 
          'Bitte speichern Sie zuerst Ihre LinkedIn Client ID und Client Secret in den Integrationseinstellungen.' : 
          'Ein unerwarteter Fehler ist aufgetreten.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});