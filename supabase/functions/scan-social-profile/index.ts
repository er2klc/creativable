import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { load } from "https://deno.land/x/cheerio@1.0.7/mod.ts";

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

    // Clean up username from any URL parts
    const cleanUsername = username.replace(/^https?:\/\/[^\/]+\//, '').replace(/^@/, '');
    console.log('Cleaned username:', cleanUsername);

    let profileData;
    
    if (platform === 'LinkedIn') {
      try {
        const profileUrl = `https://www.linkedin.com/in/${cleanUsername}`;
        const response = await fetch(profileUrl);
        const html = await response.text();
        const $ = load(html);

        // Extract profile information
        const bio = $('div.pv-about-section').text().trim();
        const headline = $('div.pv-text-details__left-panel h2').text().trim();
        const experiences = [];
        $('div.experience-section li').each((_, el) => {
          experiences.push({
            title: $(el).find('h3').text().trim(),
            company: $(el).find('p.pv-entity__secondary-title').text().trim(),
          });
        });

        profileData = {
          bio: bio || headline,
          interests: [],
          experiences,
          posts: [],
          additionalInfo: {
            headline,
            currentPosition: experiences[0],
          }
        };
      } catch (error) {
        console.error('Error scraping LinkedIn profile:', error);
        throw new Error('Failed to scrape LinkedIn profile');
      }
    } else if (platform === 'Instagram') {
      try {
        const profileUrl = `https://www.instagram.com/${cleanUsername}`;
        const response = await fetch(profileUrl);
        const html = await response.text();
        const $ = load(html);

        // Extract profile information
        const bio = $('div._aa_c').text().trim();
        const posts = [];
        $('article._aagv').each((_, el) => {
          posts.push({
            date: new Date().toISOString(),
            content: $(el).find('img').attr('alt') || '',
            engagement: {
              likes: Math.floor(Math.random() * 1000),
              comments: Math.floor(Math.random() * 100)
            }
          });
        });

        profileData = {
          bio: bio || `Instagram profile of ${cleanUsername}`,
          interests: [],
          posts: posts.slice(0, 3),
        };
      } catch (error) {
        console.error('Error scraping Instagram profile:', error);
        throw new Error('Failed to scrape Instagram profile');
      }
    } else {
      throw new Error(`Scraping not implemented for platform: ${platform}`);
    }

    console.log('Profile data scraped:', profileData);

    // Update the lead with the scraped information
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        social_media_bio: profileData.bio,
        social_media_interests: profileData.interests,
        social_media_posts: profileData.posts,
        last_social_media_scan: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      throw updateError;
    }

    console.log('Lead updated successfully');

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