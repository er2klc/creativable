import { SocialMediaStats, extractInstagramStats } from "../_shared/social-media-utils.ts";

export async function scanInstagramProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning Instagram profile for:', username);
  
  try {
    // Use a more browser-like request
    const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch Instagram profile:', response.status, response.statusText);
      return {};
    }

    const html = await response.text();
    console.log('Successfully fetched Instagram profile HTML');
    
    // Try to extract data from multiple possible formats
    let stats = extractInstagramStats(html);
    
    // If no data found, try alternative URL
    if (Object.keys(stats).length === 0) {
      console.log('Trying alternative Instagram API endpoint...');
      const altResponse = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'X-IG-App-ID': '936619743392459',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (altResponse.ok) {
        const jsonData = await altResponse.json();
        if (jsonData.data?.user) {
          const user = jsonData.data.user;
          stats = {
            bio: user.biography || null,
            followers: user.edge_followed_by?.count || null,
            following: user.edge_follow?.count || null,
            posts: user.edge_owner_to_timeline_media?.count || null,
            isPrivate: user.is_private || null
          };
          console.log('Successfully extracted stats from alternative endpoint:', stats);
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {};
  }
}