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
    const { platform, message, leadId, socialMediaUsername } = await req.json();
    console.log('Processing message request:', { platform, leadId, socialMediaUsername });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('User auth error:', authError);
      throw new Error('Invalid authorization token');
    }

    // Get platform authentication status
    const { data: authStatus, error: authStatusError } = await supabaseClient
      .from('platform_auth_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform.toLowerCase())
      .single();

    if (authStatusError || !authStatus?.access_token) {
      console.error('Auth status error:', authStatusError);
      throw new Error(`Please connect your ${platform} account in the settings first`);
    }

    if (platform.toLowerCase() === 'instagram') {
      console.log('Sending Instagram message to:', socialMediaUsername);
      
      // First, get the Instagram Business Account ID for the recipient
      const businessAccountResponse = await fetch(
        `https://graph.facebook.com/v18.0/ig_username/${socialMediaUsername}?access_token=${authStatus.access_token}`
      );

      if (!businessAccountResponse.ok) {
        const error = await businessAccountResponse.json();
        console.error('Error getting Instagram business account:', error);
        throw new Error('Could not find Instagram account');
      }

      const businessAccountData = await businessAccountResponse.json();
      const recipientId = businessAccountData.id;

      // Send message using Instagram Graph API
      const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStatus.access_token}`
        },
        body: JSON.stringify({
          recipient: { instagram_id: recipientId },
          message: { text: message }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Instagram API error:', error);
        throw new Error(error.error?.message || 'Failed to send Instagram message');
      }

      // Save message to database
      const { error: insertError } = await supabaseClient
        .from('messages')
        .insert({
          lead_id: leadId,
          user_id: user.id,
          platform,
          content: message,
          sent_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error saving message:', insertError);
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
      }
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
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});