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
    const { code } = await req.json();
    
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

    // Get user's Instagram credentials
    const { data: settings } = await supabase
      .from('settings')
      .select('instagram_app_id, instagram_app_secret')
      .eq('user_id', user.id)
      .single();

    if (!settings?.instagram_app_id || !settings?.instagram_app_secret) {
      throw new Error('Instagram credentials not found');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.facebook.com/v18.0/oauth/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: settings.instagram_app_id,
        client_secret: settings.instagram_app_secret,
        grant_type: 'authorization_code',
        redirect_uri: `${req.headers.get('origin')}/auth/callback/instagram`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Instagram token exchange error:', errorData);
      throw new Error('Failed to exchange code for access token');
    }

    const tokenData = await tokenResponse.json();
    console.log('Instagram token data:', tokenData);

    if (!tokenData.access_token) {
      throw new Error('No access token received');
    }

    // Update settings with Instagram token and connection status
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        instagram_auth_token: tokenData.access_token,
        instagram_connected: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating settings:', updateError);
      throw new Error('Failed to update settings');
    }

    return new Response(JSON.stringify({ success: true }), {
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