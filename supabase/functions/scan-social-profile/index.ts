import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, username } = await req.json();
    
    if (platform === 'instagram') {
      console.log('Starting Instagram profile scan for:', username);
      
      // Launch browser
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      try {
        const page = await browser.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to profile
        const profileUrl = username.startsWith('http') ? username : `https://www.instagram.com/${username}/`;
        await page.goto(profileUrl, { waitUntil: 'networkidle0' });
        
        // Extract data using selectors and meta tags
        const data = await page.evaluate(() => {
          const getMetaContent = (property: string) => {
            const meta = document.querySelector(`meta[property="${property}"]`);
            return meta ? meta.getAttribute('content') : null;
          };

          // Get follower count from meta description
          const description = getMetaContent('og:description') || '';
          const followersMatch = description.match(/(\d+(?:,\d+)*)\s+Followers/i);
          const followers = followersMatch ? parseInt(followersMatch[1].replace(/,/g, '')) : null;

          // Get profile image
          const profileImage = getMetaContent('og:image');
          
          // Get bio from meta description
          const bioMatch = description.match(/^([^.]+)/);
          const bio = bioMatch ? bioMatch[1].trim() : null;

          return {
            followers,
            following: null, // Instagram API restrictions
            posts: null, // Instagram API restrictions
            bio,
            isPrivate: !document.querySelector('article'), // If no posts are visible, likely private
            profile_pic_url: profileImage,
            engagement_rate: null
          };
        });

        console.log('Extracted Instagram data:', data);
        
        await browser.close();
        
        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error during page evaluation:', error);
        await browser.close();
        throw error;
      }
    }

    throw new Error('Unsupported platform');
  } catch (error) {
    console.error('Error scanning profile:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        followers: null,
        following: null,
        posts: null,
        bio: null,
        isPrivate: null,
        engagement_rate: null,
        profile_pic_url: null
      }),
      { 
        status: 200, // Return 200 even on error, but with null values
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});