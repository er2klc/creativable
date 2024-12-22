import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User auth error:', userError);
      throw new Error('Invalid authorization token');
    }

    const { platform, message, leadId } = await req.json();
    console.log('Received request:', { platform, leadId, userId: user.id });

    // Get auth status for the platform
    const { data: authStatus, error: authError } = await supabaseClient
      .from('platform_auth_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform.toLowerCase())
      .single();

    if (authError) {
      console.error('Auth status error:', authError);
      throw new Error(`Error fetching authentication for ${platform}`);
    }

    if (!authStatus?.access_token) {
      console.error('No access token found for platform:', platform);
      throw new Error(`Please connect your ${platform} account in the settings first`);
    }

    // Get lead details
    const { data: lead, error: leadError } = await supabaseClient
      .from('leads')
      .select('social_media_username')
      .eq('id', leadId)
      .single();

    if (leadError || !lead?.social_media_username) {
      console.error('Lead error:', leadError);
      throw new Error('Lead not found or missing social media username');
    }

    if (platform.toLowerCase() === 'linkedin') {
      // Extract member URN from username or profile URL
      const profilePath = lead.social_media_username.split('/').pop()?.split('?')[0];
      if (!profilePath) {
        throw new Error('Invalid LinkedIn profile URL or username');
      }

      console.log('Sending LinkedIn message to profile:', profilePath);
      
      // Use LinkedIn's REST API for messaging
      const messageResponse = await fetch('https://api.linkedin.com/rest/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStatus.access_token}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202304',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          recipients: [`urn:li:person:${profilePath}`],
          message: {
            subject: "",
            body: message,
          }
        }),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.text();
        console.error('LinkedIn API error:', errorData);
        throw new Error(`Failed to send LinkedIn message: ${errorData}`);
      }

      console.log('LinkedIn message sent successfully');
    }

    // Save message to database
    const { error: insertError } = await supabaseClient
      .from('messages')
      .insert({
        lead_id: leadId,
        user_id: user.id,
        platform,
        content: message,
      });

    if (insertError) {
      console.error('Error saving message:', insertError);
      throw new Error('Failed to save message to database');
    }

    // Update lead's last action
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({
        last_action: 'Message sent',
        last_action_date: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      // Don't throw here as the message was already sent
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in send-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});