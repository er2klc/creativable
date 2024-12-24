import { SocialMediaStats } from "../_shared/social-media-utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export async function scanLinkedInProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning LinkedIn profile for:', username);
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth status to retrieve access token
    const { data: authStatus, error: authError } = await supabase
      .from('platform_auth_status')
      .select('access_token')
      .eq('platform', 'linkedin')
      .single();

    if (authError || !authStatus?.access_token) {
      console.error('LinkedIn access token not found:', authError);
      return {};
    }

    console.log('Retrieved LinkedIn access token');

    // Make API call to LinkedIn
    const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,headline,profilePicture,publicProfileUrl)', {
      headers: {
        'Authorization': `Bearer ${authStatus.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304'
      }
    });

    if (!response.ok) {
      console.error('LinkedIn API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('LinkedIn API error details:', errorText);
      return {};
    }

    const profileData = await response.json();
    console.log('LinkedIn profile data:', profileData);

    // Get connections count
    const connectionsResponse = await fetch('https://api.linkedin.com/v2/connections?q=viewer&start=0&count=0', {
      headers: {
        'Authorization': `Bearer ${authStatus.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304'
      }
    });

    let connections = null;
    if (connectionsResponse.ok) {
      const connectionsData = await connectionsResponse.json();
      connections = connectionsData._total || null;
      console.log('LinkedIn connections count:', connections);
    } else {
      console.error('Failed to fetch connections:', connectionsResponse.status, connectionsResponse.statusText);
    }

    return {
      bio: profileData.headline || null,
      connections: connections,
      headline: profileData.headline || null
    };
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    return {};
  }
}