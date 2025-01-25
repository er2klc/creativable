import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { scanLinkedInProfile } from './linkedin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { platform, username, leadId } = await req.json()
    
    console.log('Starting scan for profile:', {
      platform,
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let profileData;
    
    if (platform === 'linkedin') {
      profileData = await scanLinkedInProfile(username);
    } else if (platform === 'instagram') {
      const { data: settings } = await supabaseClient
        .from('settings')
        .select('apify_api_key')
        .single();

      const response = await fetch(
        'https://api.apify.com/v2/acts/scrap3r~instagram-profile-scraper/run-sync-get-dataset-items', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apify_api_key}`
          },
          body: JSON.stringify({
            "username": username
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Apify API error: ${response.status}`);
      }

      const data = await response.json();
      profileData = {
        name: data.name,
        bio: data.bio,
        followers: data.followers,
        following: data.following,
        avatar_url: data.avatar_url,
        engagement_rate: data.engagement_rate,
      };
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    if (profileData) {
      const { error: updateError } = await supabaseClient
        .from('leads')
        .update({
          name: profileData.name || username,
          social_media_bio: profileData.bio,
          social_media_followers: profileData.followers,
          social_media_following: profileData.following,
          social_media_engagement_rate: profileData.engagement_rate,
          social_media_profile_image_url: profileData.avatar_url,
          last_social_media_scan: new Date().toISOString()
        })
        .eq('id', leadId);

      if (updateError) {
        console.error('Error updating lead:', updateError);
        throw updateError;
      }
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
    )
  }
});