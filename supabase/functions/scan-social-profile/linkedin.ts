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
      .select('access_token, auth_token, refresh_token')
      .eq('platform', 'linkedin')
      .single();

    if (authError) {
      console.error('Error fetching LinkedIn auth status:', authError);
      throw new Error('Could not retrieve LinkedIn authentication status');
    }

    if (!authStatus?.access_token) {
      console.error('No LinkedIn access token found in auth status');
      throw new Error('LinkedIn access token not found. Please reconnect your account.');
    }

    console.log('Successfully retrieved LinkedIn access token');

    // Make API call to LinkedIn
    console.log('Fetching LinkedIn profile data...');
    const response = await fetch(`https://api.linkedin.com/v2/people/(id:${username})`, {
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
      
      if (response.status === 401) {
        // Try to refresh the token
        try {
          const refreshData = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: authStatus.refresh_token,
              client_id: authStatus.auth_token,
              client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET') || '',
            }),
          });

          if (refreshData.ok) {
            const newToken = await refreshData.json();
            // Update token in database
            await supabase
              .from('platform_auth_status')
              .update({
                access_token: newToken.access_token,
                expires_at: new Date(Date.now() + newToken.expires_in * 1000).toISOString(),
              })
              .eq('platform', 'linkedin');

            // Retry the original request with new token
            return scanLinkedInProfile(username);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
        }
      }
      
      throw new Error('Failed to fetch LinkedIn profile data');
    }

    const profileData = await response.json();
    console.log('LinkedIn profile data:', JSON.stringify(profileData, null, 2));

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
      console.log('LinkedIn connections response:', JSON.stringify(connectionsData, null, 2));
      connections = connectionsData._total || null;
      console.log('Successfully retrieved LinkedIn connections count:', connections);
    } else {
      console.error('Failed to fetch connections:', {
        status: connectionsResponse.status,
        statusText: connectionsResponse.statusText,
        headers: Object.fromEntries(connectionsResponse.headers.entries())
      });
    }

    // Extract the headline and other profile information
    const headline = profileData.headline?.localized?.['en_US'] || 
                    profileData.headline?.localized?.['de_DE'] || 
                    profileData.headline || 
                    profileData.localizedHeadline || null;

    const bio = profileData.description?.localized?.['en_US'] || 
                profileData.description?.localized?.['de_DE'] || 
                profileData.description || 
                headline || null;

    return {
      bio: bio,
      connections: connections,
      headline: headline,
      isPrivate: false // LinkedIn API doesn't provide this information
    };
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    throw error;
  }
}