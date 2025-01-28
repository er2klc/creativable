import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { scanLinkedInProfile } from "../_shared/linkedin/profile-scanner.ts";
import { ProgressTracker } from "../_shared/linkedin/progress-tracker.ts";

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

    const progress = new ProgressTracker(supabaseClient, leadId);

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

    await progress.updateProgress(0, "Starting LinkedIn scan...");

    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings');
    }

    await progress.updateProgress(20, "Connecting to LinkedIn profile...");
    
    const profileData = await scanLinkedInProfile({
      username,
      leadId,
      apifyApiKey: settings.apify_api_key
    });

    await progress.updateProgress(60, "Processing profile information...");

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

    await progress.updateProgress(80, "Processing LinkedIn posts...");

    // Process and store LinkedIn posts
    if (profileData.activity && Array.isArray(profileData.activity)) {
      const posts = profileData.activity.map((post: any) => ({
        id: post.postId || `${leadId}-${Math.random().toString(36).substr(2, 9)}`,
        lead_id: leadId,
        content: post.text || '',
        url: post.postUrl || null,
        media_urls: post.images || [],
        post_type: post.type || 'post',
        likes_count: post.likes || 0,
        comments_count: post.comments || 0,
        shares_count: post.shares || 0,
        posted_at: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
        reactions: post.reactions || {},
        metadata: post
      }));

      if (posts.length > 0) {
        const { error: postsError } = await supabaseClient
          .from('linkedin_posts')
          .upsert(posts, {
            onConflict: 'id'
          });

        if (postsError) {
          console.error('Error storing LinkedIn posts:', postsError);
        }
      }
    }

    // Store scan history
    const scanHistory = {
      lead_id: leadId,
      platform: 'LinkedIn',
      scanned_at: new Date().toISOString(),
      followers_count: profileData.followers || 0,
      following_count: profileData.connections || 0,
      posts_count: profileData.activity?.length || 0,
      engagement_rate: profileData.engagementRate || null,
      success: true,
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
      .insert(scanHistory);

    if (scanHistoryError) {
      console.error('Error storing scan history:', scanHistoryError);
      throw new Error('Failed to store scan history');
    }

    await progress.updateProgress(100, "Profile scan completed!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'LinkedIn profile scanned successfully',
        data: profileData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
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