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
    const { platform, message, leadId } = await req.json();
    console.log('Processing message request:', { platform, leadId });

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

    console.log('Found valid auth status with access token');

    // Get lead information
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
      const profileUrl = lead.social_media_username;
      console.log('Processing LinkedIn profile URL:', profileUrl);

      // Extract profile ID from URL
      let profileId;
      if (profileUrl.includes('linkedin.com/in/')) {
        profileId = profileUrl.split('linkedin.com/in/')[1].split('/')[0].split('?')[0];
      } else {
        profileId = profileUrl.split('/')[0].split('?')[0];
      }

      if (!profileId) {
        throw new Error('Could not extract LinkedIn profile ID');
      }

      console.log('Extracted LinkedIn profile ID:', profileId);
      console.log('Using access token:', authStatus.access_token);

      try {
        // First, verify the access token with /me endpoint
        const meResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${authStatus.access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202304',
          },
        });

        if (!meResponse.ok) {
          const errorData = await meResponse.text();
          console.error('LinkedIn /userinfo endpoint error:', errorData);
          throw new Error('LinkedIn access token validation failed. Please check your connection in settings.');
        }

        const meData = await meResponse.json();
        console.log('LinkedIn user profile verified:', meData);

        // Send message using the messaging API
        const messageResponse = await fetch('https://api.linkedin.com/v2/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStatus.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202304',
          },
          body: JSON.stringify({
            recipients: [`urn:li:person:${profileId}`],
            message: {
              subject: "",
              body: message
            }
          }),
        });

        if (!messageResponse.ok) {
          const errorData = await messageResponse.text();
          console.error('LinkedIn messaging API error:', errorData);
          throw new Error(`Failed to send LinkedIn message: ${errorData}`);
        }

        const messageData = await messageResponse.json();
        console.log('LinkedIn message sent successfully:', messageData);

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
      } catch (error) {
        console.error('Error sending LinkedIn message:', error);
        throw error;
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});