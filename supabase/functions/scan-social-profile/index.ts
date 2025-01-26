import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { scanInstagramProfile } from "./platforms/instagram.ts";
import { scanLinkedInProfile } from "./platforms/linkedin.ts";
import { corsHeaders } from "./_shared/social-media-utils.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, username, leadId } = await req.json();
    
    console.log('Starting scan for profile:', {
      platform,
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let profileData;
    switch (platform.toLowerCase()) {
      case 'instagram':
        profileData = await scanInstagramProfile(username);
        break;
      case 'linkedin':
        profileData = await scanLinkedInProfile(username);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    if (!profileData) {
      throw new Error('No profile data returned');
    }

    // Update lead with profile data
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({
        social_media_bio: profileData.bio,
        social_media_followers: profileData.followers || 0,
        social_media_following: profileData.following || 0,
        social_media_engagement_rate: 0,
        last_social_media_scan: new Date().toISOString(),
        linkedin_headline: platform === 'linkedin' ? profileData.headline : null,
        linkedin_connections: platform === 'linkedin' ? profileData.connections : null,
        company_name: platform === 'linkedin' ? profileData.company_name : null,
        position: platform === 'linkedin' ? profileData.position : null
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, data: profileData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error during scan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during scanning'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});