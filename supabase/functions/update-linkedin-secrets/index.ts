import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { getSupabase } from '../_shared/supabase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, clientSecret } = await req.json();
    
    // Get the user's ID from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabase = getSupabase();

    // Verify the JWT and get the user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    // Store credentials in platform_auth_status table
    const { error: platformError } = await supabase
      .from('platform_auth_status')
      .upsert({
        user_id: user.id,
        platform: 'linkedin',
        auth_token: clientId, // Store clientId as auth_token
        refresh_token: clientSecret, // Store clientSecret as refresh_token
        is_connected: false, // Will be set to true after successful OAuth
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      });

    if (platformError) {
      console.error('Error storing LinkedIn credentials:', platformError);
      throw platformError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-linkedin-secrets:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});