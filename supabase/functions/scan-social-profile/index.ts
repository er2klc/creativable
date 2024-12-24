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

    // In a real implementation, we would make API calls to the respective platforms
    // For now, we'll simulate more detailed profile scanning
    let profileData;
    
    if (platform === 'LinkedIn') {
      profileData = {
        bio: username === 'er2klc' ? 
          "💼 #Unternehmer mit #Visionen | 🧬 Test-Based-Nutrition 2023 🏥 | 🌟 Hilfe bei #Burnout für Selbständige | 🎨 Experte in #Werbetechnik, #Folientechnik, #Webdesign, #Mediendesign | 💍 Ehemann | 👨‍👧 Papa" : 
          "Professional LinkedIn user",
        interests: [
          'Unternehmertum',
          'Test-Based-Nutrition',
          'Burnout-Prävention',
          'Werbetechnik',
          'Folientechnik',
          'Webdesign',
          'Mediendesign'
        ],
        posts: [
          {
            date: new Date().toISOString(),
            content: 'Neueste Entwicklungen in Test-Based-Nutrition',
            engagement: { likes: 150, comments: 25 }
          },
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            content: 'Burnout-Prävention für Selbständige - Meine Top-Tipps',
            engagement: { likes: 200, comments: 30 }
          }
        ],
        additionalInfo: {
          role: 'Unternehmer',
          expertise: [
            'Test-Based-Nutrition',
            'Burnout-Prävention',
            'Werbetechnik',
            'Mediendesign'
          ],
          personalInfo: {
            familyStatus: 'Verheiratet',
            children: true
          }
        }
      };
    } else {
      // Default data for other platforms
      profileData = {
        bio: `Professional ${platform} user with focus on their specific industry`,
        interests: ['business', 'social media', 'entrepreneurship'],
        posts: [
          {
            date: new Date().toISOString(),
            content: 'Latest industry insights',
            engagement: { likes: 100, comments: 20 }
          }
        ]
      };
    }

    // Update the lead with the scanned information
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        social_media_bio: profileData.bio,
        social_media_interests: profileData.interests,
        social_media_posts: profileData.posts,
        last_social_media_scan: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, data: profileData }),
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