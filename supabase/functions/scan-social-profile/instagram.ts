import { SocialMediaStats } from "../_shared/social-media-utils.ts";

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
      throw new Error(`Failed to fetch Instagram profile: ${response.status}`);
    }

    const html = await response.text();
    console.log('Successfully fetched Instagram profile HTML');
    
    // Try to extract data from multiple possible formats
    let stats: SocialMediaStats = {};
    
    try {
      // Try parsing as JSON first
      const jsonData = JSON.parse(html);
      if (jsonData.graphql?.user) {
        const user = jsonData.graphql.user;
        stats = {
          bio: user.biography,
          followers: user.edge_followed_by?.count,
          following: user.edge_follow?.count,
          posts: user.edge_owner_to_timeline_media?.count,
          isPrivate: user.is_private
        };
      }
    } catch (e) {
      console.log('Could not parse JSON response, trying HTML extraction');
      // If JSON parsing fails, try extracting from HTML
      const extractedStats = extractInstagramStats(html);
      stats = { ...extractedStats };
    }

    // Log the extracted data
    console.log('Extracted Instagram stats:', stats);
    
    return stats;
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {};
  }
}

function extractInstagramStats(html: string): SocialMediaStats {
  const stats: SocialMediaStats = {};
  
  // Extract bio
  const bioMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
  if (bioMatch) {
    stats.bio = bioMatch[1].split('Followers')[0].trim();
  }
  
  // Extract followers count
  const followersMatch = html.match(/(\d+(?:,\d+)*)\s*Followers/);
  if (followersMatch) {
    stats.followers = parseInt(followersMatch[1].replace(/,/g, ''));
  }
  
  // Extract following count
  const followingMatch = html.match(/(\d+(?:,\d+)*)\s*Following/);
  if (followingMatch) {
    stats.following = parseInt(followingMatch[1].replace(/,/g, ''));
  }
  
  // Extract posts count
  const postsMatch = html.match(/(\d+(?:,\d+)*)\s*Posts/);
  if (postsMatch) {
    stats.posts = parseInt(postsMatch[1].replace(/,/g, ''));
  }
  
  // Check if account is private
  stats.isPrivate = html.includes('This Account is Private');
  
  return stats;
}