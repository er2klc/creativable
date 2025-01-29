import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabase } from "../_shared/supabase.ts";
import { processLinkedInData } from "../_shared/linkedin/data-processor.ts";

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
    console.log('Starting LinkedIn profile scan for username:', username);

    if (!username || !leadId) {
      throw new Error('Username and leadId are required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Invalid authorization token');

    // Get user's Apify API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('apify_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.apify_api_key) {
      throw new Error('Apify API key not found in settings');
    }

    // Create initial scan history record
    const { error: initialScanError } = await supabase
      .from('social_media_scan_history')
      .insert({
        lead_id: leadId,
        platform: 'linkedin',
        processing_progress: 0,
        current_file: 'Verbindung zu LinkedIn wird hergestellt... 🔗',
        success: false
      });

    if (initialScanError) {
      console.error('Error creating initial scan history:', initialScanError);
      throw initialScanError;
    }

    try {
      await updateScanProgress(supabase, leadId, 10, 'Profil wird aufgerufen... 🔍');

      // Prepare the LinkedIn profile URL
      const linkedInUrl = username.startsWith('https://') ? 
        username : 
        `https://www.linkedin.com/in/${username.replace(/^@/, '')}`;

      console.log('Starting Apify actor run for profile URL:', linkedInUrl);

      // Start the Apify run using run-sync endpoint
      const runResponse = await fetch(
        'https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/run-sync',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apify_api_key}`,
          },
          body: JSON.stringify({
            url: [linkedInUrl]
          })
        }
      );

      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        console.error('Failed to execute Apify actor:', errorText);
        
        // Update scan history with error
        await supabase
          .from('social_media_scan_history')
          .update({
            success: false,
            error_message: `Failed to execute Apify actor: ${errorText}`,
            processing_progress: 100,
            current_file: `Fehler beim Scan: ${errorText} ❌`
          })
          .eq('lead_id', leadId)
          .eq('platform', 'linkedin');
          
        throw new Error(`Failed to execute Apify actor: ${errorText}`);
      }

      const actorResult = await runResponse.json();
      console.log('Actor result:', JSON.stringify(actorResult, null, 2));

      if (!actorResult?.data?.[0]) {
        throw new Error('No profile data returned from Apify');
      }

      await updateScanProgress(supabase, leadId, 75, 'Profildaten werden verarbeitet... 💼');

      // Process the LinkedIn data
      const profileData = actorResult.data[0];
      const { leadUpdate, experiencePosts, educationPosts } = await processLinkedInData(profileData, leadId);
      
      console.log('Processed LinkedIn data:', {
        leadUpdate,
        experiencePosts,
        educationPosts
      });

      // Update the lead with LinkedIn data
      const { error: updateLeadError } = await supabase
        .from('leads')
        .update({
          ...leadUpdate,
          platform: 'LinkedIn',
          last_social_media_scan: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (updateLeadError) throw updateLeadError;

      await updateScanProgress(supabase, leadId, 90, 'Daten werden gespeichert... 💾');

      // Insert LinkedIn posts (experience and education)
      if (Array.isArray(experiencePosts) && experiencePosts.length > 0 || 
          Array.isArray(educationPosts) && educationPosts.length > 0) {
        const postsWithLeadId = [...(experiencePosts || []), ...(educationPosts || [])].map(post => ({
          ...post,
          lead_id: leadId
        }));

        if (postsWithLeadId.length > 0) {
          const { error: postsError } = await supabase
            .from('linkedin_posts')
            .upsert(postsWithLeadId, {
              onConflict: 'id'
            });

          if (postsError) {
            console.error('Error storing LinkedIn posts:', postsError);
          }
        }
      }

      // Update scan history with final success status
      await updateScanProgress(supabase, leadId, 100, 'Scan erfolgreich abgeschlossen! ✅', true);

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
      // Update scan history with error
      await supabase
        .from('social_media_scan_history')
        .update({
          success: false,
          error_message: error.message,
          processing_progress: 100,
          current_file: `Fehler beim Scan: ${error.message} ❌`
        })
        .eq('lead_id', leadId)
        .eq('platform', 'linkedin');
        
      throw error;
    }

  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

async function updateScanProgress(
  supabase: any,
  leadId: string,
  progress: number,
  statusMessage: string,
  success: boolean = false
) {
  const { error } = await supabase
    .from('social_media_scan_history')
    .update({
      processing_progress: progress,
      current_file: statusMessage,
      success: success,
      scanned_at: success ? new Date().toISOString() : null
    })
    .eq('lead_id', leadId)
    .eq('platform', 'linkedin');

  if (error) {
    console.error('Error updating scan progress:', error);
  }
}