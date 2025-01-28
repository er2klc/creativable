import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { username, leadId } = requestData;
    
    console.log('Starting LinkedIn scan for:', username, 'Lead ID:', leadId);

    if (!username || !leadId) {
      throw new Error('Username and Lead ID are required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings');
    }

    await supabaseClient
      .from('social_media_scan_history')
      .upsert({
        id: `temp-${leadId}`,
        lead_id: leadId,
        platform: 'LinkedIn',
        processing_progress: 0,
        current_file: 'Starting LinkedIn scan...',
        success: false
      });

    const profileUrl = `https://www.linkedin.com/in/${username}/`;
    console.log('Starting Apify actor run for profile:', profileUrl);

    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs?token=${settings.apify_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "url": [profileUrl],
          "maxItems": 1,
          "proxyConfiguration": {
            "useApifyProxy": true
          }
        })
      }
    );

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Failed to start Apify actor:', errorText);
      throw new Error(`Failed to start Apify actor: ${errorText}`);
    }

    const runData = await apifyResponse.json();
    console.log('Apify actor run started:', runData);

    await supabaseClient
      .from('social_media_scan_history')
      .update({
        processing_progress: 20,
        current_file: `Actor run started: ${runData.data?.id}`,
      })
      .eq('lead_id', leadId);

    const maxAttempts = 30;
    let attempts = 0;
    let profileData = null;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const runStatusResponse = await fetch(
        `https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs/${runData.data.id}?token=${settings.apify_api_key}`
      );

      if (!runStatusResponse.ok) {
        console.error('Failed to check run status:', await runStatusResponse.text());
        continue;
      }

      const runStatus = await runStatusResponse.json();
      console.log('Run status:', runStatus.data?.status);

      if (runStatus.data?.status === 'SUCCEEDED') {
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/runs/${runData.data.id}/dataset/items?token=${settings.apify_api_key}`
        );

        if (datasetResponse.ok) {
          profileData = await datasetResponse.json();
          if (profileData && profileData.length > 0) {
            break;
          }
        }
      } else if (runStatus.data?.status === 'FAILED') {
        throw new Error(`Actor run failed: ${runStatus.data?.errorMessage || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!profileData || !Array.isArray(profileData) || profileData.length === 0) {
      throw new Error('No profile data returned from Apify');
    }

    const profile = profileData[0];
    console.log('Retrieved profile data:', profile);

    const leadData = {
      social_media_bio: profile.about || '',
      social_media_profile_image_url: profile.avatar || null,
      social_media_followers: profile.followers || 0,
      social_media_following: profile.connections || 0,
      experience: profile.experience || [],
      current_company_name: profile.current_company?.name || null,
      linkedin_id: profile.linkedin_id || null,
      last_social_media_scan: new Date().toISOString()
    };

    const { error: leadUpdateError } = await supabaseClient
      .from('leads')
      .update(leadData)
      .eq('id', leadId);

    if (leadUpdateError) {
      console.error('Error updating lead:', leadUpdateError);
      throw new Error('Failed to update lead data');
    }

    const scanHistory = {
      lead_id: leadId,
      platform: 'LinkedIn',
      scanned_at: new Date().toISOString(),
      followers_count: profile.followers || 0,
      following_count: profile.connections || 0,
      engagement_rate: null,
      success: true,
      processing_progress: 100,
      current_file: 'Scan completed successfully',
      profile_data: {
        headline: profile.about || '',
        summary: profile.about || '',
        location: profile.city || '',
        industry: '',
      },
      experience: profile.experience || [],
      education: profile.education || [],
      skills: [],
      certifications: [],
      languages: [],
      recommendations: profile.recommendations || []
    };

    const { error: scanHistoryError } = await supabaseClient
      .from('social_media_scan_history')
      .upsert(scanHistory);

    if (scanHistoryError) {
      console.error('Error storing scan history:', scanHistoryError);
      throw new Error('Failed to store scan history');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'LinkedIn profile scan completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { leadId } = await req.json().catch(() => ({ leadId: null }));

      if (leadId) {
        await supabaseClient
          .from('social_media_scan_history')
          .update({
            success: false,
            error_message: error.message || 'Unknown error occurred',
            current_file: 'Error during scan',
            processing_progress: 0
          })
          .eq('lead_id', leadId)
          .eq('platform', 'LinkedIn');
      }
    } catch (updateError) {
      console.error('Error updating scan history with error:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to scan LinkedIn profile' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});