import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, platform, username } = await req.json();
    console.log(`Scanning profile for lead ${leadId} on ${platform}: ${username}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mock data for demonstration
    // In a real implementation, this would make API calls to the respective platforms
    const mockData = {
      bio: `Professional ${platform} user focused on digital marketing and business growth`,
      interests: ['marketing', 'business', 'social media', 'entrepreneurship'],
      posts: [
        {
          date: new Date().toISOString(),
          content: 'Excited to share my latest project!',
          engagement: { likes: 150, comments: 25 }
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          content: 'Tips for growing your business on social media',
          engagement: { likes: 200, comments: 30 }
        }
      ]
    };

    // Update the lead with the scanned information
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        social_media_bio: mockData.bio,
        social_media_interests: mockData.interests,
        social_media_posts: mockData.posts,
        last_social_media_scan: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, data: mockData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scan-social-profile function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});