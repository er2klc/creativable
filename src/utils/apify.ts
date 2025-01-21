import { ApifyClient } from 'apify-client';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export interface InstagramProfile {
  username: string;
  fullName: string | null;
  biography: string | null;
  followersCount: number | null;
  followingCount: number | null;
  postsCount: number | null;
  profilePicUrl: string | null;
  isPrivate: boolean;
  timestamp: string;
}

interface ApifyResponse {
  username: string;
  fullName?: string;
  biography?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  profilePicUrl?: string;
  isPrivate?: boolean;
}

export const getInstagramProfile = async (username: string): Promise<InstagramProfile> => {
  try {
    // Fetch API token from Supabase
    const { data: secrets, error: secretsError } = await supabase
      .from('secrets')
      .select('*')
      .eq('name', 'APIFY_API_TOKEN')
      .single();

    if (secretsError || !secrets) {
      console.error('Error fetching Apify API token:', secretsError);
      throw new Error('Apify API token not found');
    }

    // Initialize the ApifyClient with the token from secrets
    const client = new ApifyClient({
      token: secrets.value,
    });

    // Prepare Actor input
    const input = {
      "directUrls": [
        `https://www.instagram.com/${username}/`
      ],
      "resultsType": "details",
      "resultsLimit": 1,
      "searchType": "user",
      "searchLimit": 1,
      "addParentData": false
    };

    // Run the Actor and wait for it to finish
    const run = await client.actor("shu8hvrXbJbY3Eb9W").call(input);

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const profile = items[0] as ApifyResponse;

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Transform and validate the response
    return {
      username: profile.username || username,
      fullName: profile.fullName || null,
      biography: profile.biography || null,
      followersCount: typeof profile.followersCount === 'number' ? profile.followersCount : null,
      followingCount: typeof profile.followingCount === 'number' ? profile.followingCount : null,
      postsCount: typeof profile.postsCount === 'number' ? profile.postsCount : null,
      profilePicUrl: profile.profilePicUrl || null,
      isPrivate: Boolean(profile.isPrivate),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};