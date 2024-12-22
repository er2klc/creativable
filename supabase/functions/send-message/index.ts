import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get platform auth status
    const { data: authStatus, error: authError } = await supabase
      .from('platform_auth_status')
      .select('*')
      .eq('platform', platform.toLowerCase())
      .single();

    if (authError || !authStatus) {
      throw new Error(`${platform} is not connected`);
    }

    if (platform.toLowerCase() === 'linkedin') {
      if (!authStatus.access_token) {
        throw new Error('LinkedIn access token not found');
      }

      // Send message via LinkedIn API
      const response = await fetch(`https://api.linkedin.com/v2/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStatus.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [{ person: { "urn": `urn:li:person:${socialMediaUsername}` } }],
          message: {
            subject: "Neue Nachricht",
            body: message
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('LinkedIn API error:', errorData);
        throw new Error('Failed to send LinkedIn message');
      }
    }
    // ... Weitere Plattformen hier hinzufügen

    // Save message in database
    const { error: dbError } = await supabase
      .from('messages')
      .insert({
        lead_id: leadId,
        platform,
        content: message,
        sent_at: new Date().toISOString()
      });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-message function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});