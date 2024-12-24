import { SocialMediaStats, extractInstagramStats } from "../_shared/social-media-utils.ts";

export async function scanInstagramProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning Instagram profile for:', username);
  
  try {
    // First try the Instagram API
    const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const contentType = response.headers.get('content-type');
    console.log('Instagram API response content type:', contentType);

    if (!response.ok || !contentType?.includes('application/json')) {
      console.log('Instagram API response not ok or not JSON, trying HTML scraping');
      
      // Fallback to scraping the page directly
      const htmlResponse = await fetch(`https://www.instagram.com/${username}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!htmlResponse.ok) {
        throw new Error(`Failed to fetch Instagram profile: ${htmlResponse.statusText}`);
      }

      const html = await htmlResponse.text();
      return extractInstagramStats(html);
    }

    const data = await response.json();
    console.log('Instagram API data:', data);
    
    return {
      bio: data.graphql?.user?.biography || null,
      followers: data.graphql?.user?.edge_followed_by?.count || null,
      following: data.graphql?.user?.edge_follow?.count || null,
      posts: data.graphql?.user?.edge_owner_to_timeline_media?.count || null,
      isPrivate: data.graphql?.user?.is_private || null,
    };
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {};
  }
}