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
      
      try {
        console.log('Checking access token:', authStatus.access_token);
        
        // First, verify the access token
        const tokenVerifyResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?access_token=${authStatus.access_token}`
        );

        if (!tokenVerifyResponse.ok) {
          const error = await tokenVerifyResponse.json();
          console.error('Access token verification failed:', error);
          throw new Error('Invalid or expired access token');
        }

        // Get Facebook pages
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?access_token=${authStatus.access_token}`
        );

        if (!pagesResponse.ok) {
          const error = await pagesResponse.json();
          console.error('Error getting Facebook pages:', error);
          throw new Error(`Failed to fetch Facebook pages: ${error.error?.message || 'Unknown error'}`);
        }

        const pagesData = await pagesResponse.json();
        console.log('Found Facebook pages:', pagesData);

        if (!pagesData.data || pagesData.data.length === 0) {
          throw new Error('No Facebook pages found. Please make sure you have at least one Facebook page.');
        }

        // For each page, try to get the Instagram business account
        let instagramBusinessAccount = null;
        for (const page of pagesData.data) {
          console.log('Checking page for Instagram business account:', page.id);
          
          const businessAccountResponse = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${authStatus.access_token}`
          );

          if (businessAccountResponse.ok) {
            const businessData = await businessAccountResponse.json();
            console.log('Business account data for page:', businessData);
            
            if (businessData.instagram_business_account) {
              instagramBusinessAccount = businessData.instagram_business_account;
              break;
            }
          } else {
            console.error('Error fetching business account for page:', await businessAccountResponse.json());
          }
        }

        if (!instagramBusinessAccount) {
          throw new Error('No Instagram business account found. Please make sure you have connected an Instagram business account to one of your Facebook pages.');
        }

        // Send message using Instagram Graph API
        const response = await fetch(`https://graph.facebook.com/v18.0/${instagramBusinessAccount.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { username: socialMediaUsername },
            message: { text: message },
            access_token: authStatus.access_token
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
      } catch (error) {
        console.error('Error in Instagram message flow:', error);
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