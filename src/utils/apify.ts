import { ApifyClient } from 'apify-client';
import { supabase } from '@/integrations/supabase/client';

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

export const getInstagramProfile = async (username: string): Promise<InstagramProfile> => {
  try {
    // Fetch API token from Supabase
    const { data: secrets, error: secretsError } = await supabase
      .from('secrets')
      .select('*')
      .eq('name', 'APIFY_API_TOKEN')
      .single();

    if (secretsError || !secrets?.value) {
      throw new Error('Apify API token not found');
    }

    // Initialize the ApifyClient
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
    const profile = items[0] as any; // Type assertion for the raw response

    if (!profile) {
      throw new Error('Profile not found');
    }

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