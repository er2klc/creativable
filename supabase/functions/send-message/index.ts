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

      // First get the member URN using the /me endpoint with proper API version
      const meResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${authStatus.access_token}`,
          'LinkedIn-Version': '202304',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!meResponse.ok) {
        const errorData = await meResponse.text();
        console.error('LinkedIn /me API error:', errorData);
        throw new Error(`Failed to get LinkedIn profile: ${errorData}`);
      }

      const meData = await meResponse.json();
      console.log('LinkedIn profile data:', meData);

      // Try to create a post first
      try {
        const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStatus.access_token}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202304',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify({
            author: `urn:li:person:${meData.sub}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text: message
                },
                shareMediaCategory: "NONE"
              }
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS"
            }
          }),
        });

        if (!postResponse.ok) {
          const postErrorData = await postResponse.text();
          console.error('LinkedIn post API error:', postErrorData);
          throw new Error(`Failed to create LinkedIn post: ${postErrorData}`);
        }

        console.log('LinkedIn post created successfully');
      } catch (postError) {
        console.error('Error creating post, trying message instead:', postError);

        // If post fails, try to send a message
        const messageResponse = await fetch('https://api.linkedin.com/v2/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStatus.access_token}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202304',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify({
            recipients: [{
              recipientUrn: `urn:li:person:${profileId}`,
              recipientType: "PERSON"
            }],
            messageText: message,
            messageSubject: "Neue Nachricht",
            messageType: "MEMBER_TO_MEMBER"
          }),
        });

        if (!messageResponse.ok) {
          const messageErrorData = await messageResponse.text();
          console.error('LinkedIn messaging API error:', messageErrorData);
          throw new Error(`Failed to send LinkedIn message: ${messageErrorData}`);
        }

        console.log('LinkedIn message sent successfully');
      }
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