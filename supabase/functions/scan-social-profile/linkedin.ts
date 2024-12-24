import { SocialMediaStats } from "../_shared/social-media-utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export async function scanLinkedInProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning LinkedIn profile for:', username);
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth status to retrieve access token
    console.log('Fetching LinkedIn auth status...');
    const { data: authStatus, error: authError } = await supabase
      .from('platform_auth_status')
      .select('access_token')
      .eq('platform', 'linkedin')
      .single();

    if (authError) {
      console.error('Error fetching LinkedIn auth status:', authError);
      return {};
    }

    if (!authStatus?.access_token) {
      console.error('No LinkedIn access token found in auth status');
      return {};
    }

    console.log('Successfully retrieved LinkedIn access token');

    // Make API call to LinkedIn
    console.log('Fetching LinkedIn profile data...');
    const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,headline,profilePicture,vanityName)', {
      headers: {
        'Authorization': `Bearer ${authStatus.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('LinkedIn API error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      const errorText = await response.text();
      console.error('LinkedIn API error details:', errorText);
      return {};
    }

    const profileData = await response.json();
    console.log('LinkedIn profile data:', profileData);

    // Get connections count
    console.log('Fetching LinkedIn connections count...');
    const connectionsResponse = await fetch('https://api.linkedin.com/v2/connections?q=viewer&start=0&count=0', {
      headers: {
        'Authorization': `Bearer ${authStatus.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304',
        'Content-Type': 'application/json',
      }
    });

    let connections = null;
    if (connectionsResponse.ok) {
      const connectionsData = await connectionsResponse.json();
      connections = connectionsData._total || null;
      console.log('Successfully retrieved LinkedIn connections count:', connections);
    } else {
      console.error('Failed to fetch connections:', {
        status: connectionsResponse.status,
        statusText: connectionsResponse.statusText,
        headers: Object.fromEntries(connectionsResponse.headers.entries())
      });
      const errorText = await connectionsResponse.text();
      console.error('LinkedIn connections error details:', errorText);
    }

    // Extract the headline from the profile data
    const headline = profileData.headline?.localized?.['en_US'] || 
                    profileData.headline?.localized?.['de_DE'] || 
                    profileData.headline || null;

    return {
      bio: headline,
      connections: connections,
      headline: headline
    };
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    return {};
  }
}