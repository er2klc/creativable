import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { scanInstagramProfile } from "./platforms/instagram.ts";
import { scanLinkedInProfile } from "./platforms/linkedin.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, username, leadId } = await req.json();
    console.log('Starting profile scan:', { platform, username, leadId });

    if (!platform || !username || !leadId) {
      throw new Error('Missing required parameters: platform, username, and leadId are required');
    }

    // Get the user_id for the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('user_id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('Error getting lead:', leadError);
      throw new Error('Could not find lead');
    }

    let profileData;
    switch (platform.toLowerCase()) {
      case 'instagram':
        profileData = await scanInstagramProfile(username, lead.user_id);
        break;
      case 'linkedin':
        profileData = await scanLinkedInProfile(username);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    if (!profileData) {
      throw new Error('No profile data returned from platform handler');
    }

    // Update lead with profile data
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        social_media_bio: profileData.bio,
        social_media_followers: profileData.followers,
        social_media_following: profileData.following,
        social_media_engagement_rate: 0,
        last_social_media_scan: new Date().toISOString(),
        current_company_name: platform.toLowerCase() === 'linkedin' ? profileData.company_name : null,
        position: platform.toLowerCase() === 'linkedin' ? profileData.position : null
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: profileData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error during scan:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error during scanning'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});