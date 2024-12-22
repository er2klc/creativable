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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User auth error:', userError);
      throw new Error('Invalid authorization token');
    }

    const { platform, message, leadId } = await req.json();
    console.log('Received request:', { platform, leadId, userId: user.id });

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

      // Create a messaging conversation directly with the profile ID
      const conversationResponse = await fetch('https://api.linkedin.com/v2/messaging/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStatus.access_token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          recipients: [`urn:li:person:${profileId}`],
          subject: "Let's connect",
        }),
      });

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.text();
        console.error('LinkedIn conversation API error:', errorData);
        throw new Error(`Failed to create LinkedIn conversation: ${errorData}`);
      }

      const conversation = await conversationResponse.json();
      console.log('Created conversation:', conversation);

      // Send message in the conversation
      const messageResponse = await fetch(`https://api.linkedin.com/v2/messaging/conversations/${conversation.id}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStatus.access_token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          eventCreate: {
            value: {
              com_linkedin_voyager_messaging_create_message: {
                attributedBody: {
                  text: message,
                  attributes: [],
                },
                attachments: [],
              },
            },
          },
        }),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.text();
        console.error('LinkedIn message API error:', errorData);
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