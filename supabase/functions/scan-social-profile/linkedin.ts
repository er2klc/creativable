import { SocialMediaStats } from "../_shared/social-media-utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface LinkedInProfile {
  id: string;
  name: string;
  city?: string;
  country_code?: string;
  about?: string;
  current_company?: {
    name?: string;
    link?: string;
  };
  followers?: number;
  connections?: number;
  avatar?: string;
  banner_image?: string;
}

export async function scanLinkedInProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning LinkedIn profile for:', username);
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Apify API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('apify_api_key')
      .single();

    if (settingsError || !settings?.apify_api_key) {
      console.error('Error fetching Apify API key:', settingsError);
      throw new Error('Could not retrieve Apify API key');
    }

    // Start the Apify scraper
    const response = await fetch(
      'https://api.apify.com/v2/acts/scrap3r~linkedin-people-profiles-by-url/run-sync-get-dataset-items', 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apify_api_key}`
        },
        body: JSON.stringify({
          "url": [username]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const data = await response.json() as LinkedInProfile[];
    const profile = data[0];

    if (!profile) {
      throw new Error('No profile data returned');
    }

    return {
      bio: profile.about || null,
      connections: profile.connections || null,
      followers: profile.followers || null,
      avatar_url: profile.avatar || null,
      banner_url: profile.banner_image || null,
      company: profile.current_company?.name || null,
      location: profile.city || null,
      isPrivate: false
    };
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    throw error;
  }
}