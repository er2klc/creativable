import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    console.log('Starting LinkedIn scan for profile:', {
      username,
      leadId,
      timestamp: new Date().toISOString()
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: secrets, error: secretError } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', 'APIFY_API_TOKEN')
      .single();

    if (secretError || !secrets?.value) {
      console.error('Error getting Apify API key:', secretError);
      throw new Error('Could not retrieve Apify API key');
    }

    const apiKey = secrets.value;
    const BASE_URL = 'https://api.apify.com/v2';

    console.log('Starting Apify scraping run for LinkedIn');

    // Use the correct LinkedIn-specific actor
    const runResponse = await fetch(`${BASE_URL}/acts/scrap3r~linkedin-people-profiles-by-url/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startUrls: [{
          url: `https://www.linkedin.com/in/${username}`
        }],
        maxConcurrency: 1,
        maxPagesPerCrawl: 1,
        proxyConfiguration: {
          useApifyProxy: true
        }
      })
    });

    if (!runResponse.ok) {
      console.error('Error starting Apify run:', await runResponse.text());
      throw new Error(`HTTP error! status: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log('Apify LinkedIn run started:', { runId });

    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      console.log(`Polling for LinkedIn results (attempt ${attempts + 1}/${maxAttempts})`);

      const datasetResponse = await fetch(`${BASE_URL}/actor-runs/${runId}/dataset/items`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!datasetResponse.ok) {
        console.error('Error fetching LinkedIn dataset:', await datasetResponse.text());
        throw new Error(`HTTP error! status: ${datasetResponse.status}`);
      }

      const items = await datasetResponse.json();
      
      if (items.length > 0) {
        const profileData = items[0];
        console.log('LinkedIn profile data received:', profileData);

        // Download and upload profile image if available
        const newProfileImageUrl = profileData.profileImageUrl ? await downloadAndUploadImage(
          profileData.profileImageUrl,
          supabaseClient,
          leadId
        ) : null;

        // Calculate engagement rate if possible
        const engagementRate = profileData.followers > 0 && profileData.posts 
          ? (profileData.posts.reduce((sum: number, post: any) => 
              sum + (post.likes || 0) + (post.comments || 0), 0) / 
              (profileData.posts?.length || 1)) / profileData.followers
          : 0;

        // Update lead with LinkedIn data
        const { error: updateError } = await supabaseClient
          .from('leads')
          .update({
            name: profileData.fullName || username,
            social_media_bio: profileData.summary || profileData.headline,
            social_media_followers: profileData.connections || 0,
            social_media_following: profileData.following || 0,
            social_media_engagement_rate: engagementRate,
            social_media_profile_image_url: newProfileImageUrl,
            current_company_name: profileData.currentCompany?.name,
            experience: profileData.experience || [],
            linkedin_id: profileData.linkedinProfile,
            last_social_media_scan: new Date().toISOString()
          })
          .eq('id', leadId);

        if (updateError) {
          console.error('Error updating lead with LinkedIn data:', updateError);
          throw updateError;
        }

        return new Response(
          JSON.stringify({ success: true, data: profileData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Timeout waiting for LinkedIn results');
  } catch (error) {
    console.error('Error during LinkedIn scan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during LinkedIn scanning'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

async function downloadAndUploadImage(imageUrl: string, supabaseClient: any, leadId: string): Promise<string | null> {
  try {
    if (!imageUrl) return null;

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const imageBuffer = await response.arrayBuffer();
    const fileExt = 'jpg';
    const fileName = `${leadId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('contact-avatars')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading LinkedIn profile image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('contact-avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error processing LinkedIn profile image:', error);
    return null;
  }
}