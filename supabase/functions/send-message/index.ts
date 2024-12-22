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

    // Check if token is expired
    if (authStatus.expires_at && new Date(authStatus.expires_at) <= new Date()) {
      console.log('Access token expired, attempting refresh...');
      
      try {
        const refreshResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: authStatus.refresh_token,
            client_id: authStatus.auth_token,
            client_secret: authStatus.refresh_token,
          }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        const refreshData = await refreshResponse.json();
        
        // Update token in database
        const { error: updateError } = await supabaseClient
          .from('platform_auth_status')
          .update({
            access_token: refreshData.access_token,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('platform', platform.toLowerCase());

        if (updateError) throw updateError;
        
        // Use new token
        authStatus.access_token = refreshData.access_token;
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        throw new Error('Failed to refresh LinkedIn access token. Please reconnect your account.');
      }
    }

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

      try {
        console.log('Attempting to send LinkedIn message...');
        
        // First, get the recipient's member ID using the /me endpoint
        const meResponse = await fetch('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${authStatus.access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });

        if (!meResponse.ok) {
          const errorData = await meResponse.text();
          if (meResponse.status === 401 || meResponse.status === 403) {
            throw new Error('LinkedIn access token is invalid or has insufficient permissions. Please reconnect your account.');
          }
          console.error('LinkedIn /me endpoint error:', errorData);
          throw new Error(`Failed to fetch user profile: ${errorData}`);
        }

        const meData = await meResponse.json();
        console.log('LinkedIn user profile:', meData);

        // Get connections to verify the recipient is a 1st-degree connection
        const connectionsResponse = await fetch(`https://api.linkedin.com/v2/connections?q=viewer&start=0&count=1000`, {
          headers: {
            'Authorization': `Bearer ${authStatus.access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });

        if (!connectionsResponse.ok) {
          const errorData = await connectionsResponse.text();
          console.error('LinkedIn connections error:', errorData);
          throw new Error(`Failed to fetch connections: ${errorData}`);
        }

        const connectionsData = await connectionsResponse.json();
        console.log('LinkedIn connections:', connectionsData);

        // Verify the recipient is in the connections list
        const isConnected = connectionsData.elements.some(
          (connection) => connection.miniProfile.publicIdentifier === profileId
        );

        if (!isConnected) {
          throw new Error('Recipient is not a 1st-degree connection. You can only send messages to direct connections.');
        }

        // Get the member ID from the connections data
        const connection = connectionsData.elements.find(
          (conn) => conn.miniProfile.publicIdentifier === profileId
        );

        if (!connection) {
          throw new Error('Could not find recipient in connections list');
        }

        const memberId = connection.miniProfile.id;
        const recipientUrn = `urn:li:member:${memberId}`;
        console.log('Using recipient URN:', recipientUrn);

        // Send the message using the messaging API
        const messageResponse = await fetch('https://api.linkedin.com/v2/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStatus.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            recipients: [recipientUrn],
            messageText: message,
            messageSubject: 'New Message',
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
          // Don't throw here as the message was already sent
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