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
    const { username, leadId } = await req.json();
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

    // Update scan history to show start
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

    // Get Apify API key from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings');
    }

    // Update progress to 20%
    await supabaseClient
      .from('social_media_scan_history')
      .update({
        processing_progress: 20,
        current_file: 'Connecting to LinkedIn profile...'
      })
      .eq('lead_id', leadId);

    console.log('Starting Apify actor with settings:', {
      username,
      apiKey: '***' // masked for security
    });

    // Prepare the input for Apify actor
    const actorId = 'dSuQBqyNnhPxkQZwH';
    const input = {
      linkedInProfileUrls: [`https://www.linkedin.com/in/${username}/`],
      headless: true,
      sessionPoolName: "LINKEDIN_POOL",
      maxRequestRetries: 5,
      maxConcurrency: 1,
      maxItems: 1
    };

    console.log('Apify actor input:', JSON.stringify(input, null, 2));

    // Start Apify actor
    const startResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${settings.apify_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('Failed to start Apify actor:', errorText);
      
      // Update scan history with error
      await supabaseClient
        .from('social_media_scan_history')
        .update({
          success: false,
          error_message: `Failed to start Apify actor: ${errorText}`,
          current_file: 'Error during scan',
          processing_progress: 0
        })
        .eq('lead_id', leadId);
        
      throw new Error('Failed to start LinkedIn profile scan');
    }

    const runData = await startResponse.json();
    const runId = runData.data.id;
    console.log('Apify run started with ID:', runId);

    // Update progress to 40%
    await supabaseClient
      .from('social_media_scan_history')
      .update({
        processing_progress: 40,
        current_file: 'Scanning LinkedIn profile...'
      })
      .eq('lead_id', leadId);

    // Poll for results
    let attempts = 0;
    const maxAttempts = 30;
    const delayBetweenAttempts = 2000;
    let profileData = null;

    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1}/${maxAttempts})`);

      const datasetResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${settings.apify_api_key}`
      );

      if (!datasetResponse.ok) {
        console.error('Failed to fetch dataset:', await datasetResponse.text());
        throw new Error('Failed to fetch scan results');
      }

      const items = await datasetResponse.json();
      
      if (items && items.length > 0) {
        profileData = items[0];
        console.log('Successfully retrieved profile data');
        break;
      }

      // Update progress (40-70%)
      const progressIncrement = 30 / maxAttempts;
      const currentProgress = 40 + (attempts * progressIncrement);
      
      await supabaseClient
        .from('social_media_scan_history')
        .update({
          processing_progress: Math.round(currentProgress),
          current_file: `Scanning LinkedIn profile (attempt ${attempts + 1})...`
        })
        .eq('lead_id', leadId);

      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      attempts++;
    }

    if (!profileData) {
      throw new Error('Timeout waiting for profile data');
    }

    // Update progress to 80%
    await supabaseClient
      .from('social_media_scan_history')
      .update({
        processing_progress: 80,
        current_file: 'Processing profile data...'
      })
      .eq('lead_id', leadId);

    // Update lead data
    const leadData = {
      social_media_bio: profileData.summary || '',
      social_media_profile_image_url: profileData.profileImageUrl || null,
      social_media_followers: profileData.followers || 0,
      social_media_following: profileData.connections || 0,
      social_media_engagement_rate: profileData.engagementRate || null,
      experience: profileData.experience || [],
      current_company_name: profileData.experience?.[0]?.company || null,
      linkedin_id: profileData.profileId || null,
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

    // Store final scan history
    const scanHistory = {
      lead_id: leadId,
      platform: 'LinkedIn',
      scanned_at: new Date().toISOString(),
      followers_count: profileData.followers || 0,
      following_count: profileData.connections || 0,
      posts_count: profileData.activity?.length || 0,
      engagement_rate: profileData.engagementRate || null,
      success: true,
      processing_progress: 100,
      current_file: 'Scan completed successfully',
      profile_data: {
        headline: profileData.headline || '',
        summary: profileData.summary || '',
        location: profileData.location || '',
        industry: profileData.industry || '',
      },
      experience: profileData.experience || [],
      education: profileData.education || [],
      skills: profileData.skills || [],
      certifications: profileData.certifications || [],
      languages: profileData.languages || [],
      recommendations: profileData.recommendations || []
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

      // Get leadId from the request body
      let leadId;
      try {
        const body = await req.json();
        leadId = body.leadId;
      } catch (e) {
        console.error('Error parsing request body:', e);
      }

      // Update scan history with error if we have a leadId
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