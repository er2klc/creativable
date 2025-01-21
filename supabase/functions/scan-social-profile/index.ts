import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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
      
      const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ]
      });
      
      try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const profileUrl = username.startsWith('http') ? username : `https://www.instagram.com/${username}/`;
        console.log('Navigating to:', profileUrl);
        
        await page.goto(profileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Extract data using meta tags and page content
        const data = await page.evaluate(() => {
          const getMetaContent = (property: string) => {
            const meta = document.querySelector(`meta[property="${property}"]`);
            return meta ? meta.getAttribute('content') : null;
          };

          // Get profile info from meta tags
          const description = getMetaContent('og:description') || '';
          const followersMatch = description.match(/(\d+(?:,\d+)*)\s+Followers/i);
          const followsMatch = description.match(/(\d+(?:,\d+)*)\s+Following/i);
          const postsMatch = description.match(/(\d+(?:,\d+)*)\s+Posts/i);
          
          // Get username from URL or meta tags
          const urlUsername = window.location.pathname.split('/')[1];
          const metaUsername = getMetaContent('og:title')?.split(' ')[0];
          
          // Get full name from meta title
          const fullName = getMetaContent('og:title')?.split(' • ')[0];
          
          // Get bio from meta description
          const bioMatch = description.match(/^([^.]+?)(?=\s+\d+\s+(?:Followers|Posts|Following))/i);
          const biography = bioMatch ? bioMatch[1].trim() : null;

          return {
            username: urlUsername || metaUsername,
            fullName: fullName || null,
            biography,
            followers: followersMatch ? parseInt(followersMatch[1].replace(/,/g, '')) : null,
            following: followsMatch ? parseInt(followsMatch[1].replace(/,/g, '')) : null,
            posts: postsMatch ? parseInt(postsMatch[1].replace(/,/g, '')) : null,
            url: window.location.href,
            isPrivate: !document.querySelector('article'),
            verified: !!document.querySelector('[aria-label="Verified"]'),
            profilePicUrl: getMetaContent('og:image'),
            engagement_rate: null,
            bio: biography
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
        username: null,
        fullName: null,
        biography: null,
        followers: null,
        following: null,
        posts: null,
        url: null,
        isPrivate: null,
        verified: null,
        profilePicUrl: null,
        engagement_rate: null,
        bio: null
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});