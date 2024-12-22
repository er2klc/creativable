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
    const { code, redirectUri, action, accessToken, clientId: providedClientId, clientSecret: providedClientSecret } = await req.json();

    // Get the user's authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // If this is a token revocation request
    if (action === 'revoke') {
      const response = await fetch('https://www.linkedin.com/oauth/v2/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: providedClientId,
          client_secret: providedClientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke token');
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get LinkedIn credentials from platform_auth_status
    const { data: platformAuth, error: credentialsError } = await supabaseClient
      .from('platform_auth_status')
      .select('auth_token, refresh_token')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .single();

    if (credentialsError || !platformAuth) {
      throw new Error('LinkedIn credentials not found');
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: platformAuth.auth_token,
        client_secret: platformAuth.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error_description || 'Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Update platform_auth_status with the new access token
    const { error: updateError } = await supabaseClient
      .from('platform_auth_status')
      .update({
        access_token: tokenData.access_token,
        is_connected: true,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('platform', 'linkedin');

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify(tokenData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in LinkedIn callback:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});