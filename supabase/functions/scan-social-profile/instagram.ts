import { SocialMediaStats, extractInstagramStats } from "../_shared/social-media-utils.ts";

export async function scanInstagramProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning Instagram profile for:', username);
  
  try {
    const response = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch Instagram profile:', response.status, response.statusText);
      return {};
    }

    const html = await response.text();
    console.log('Successfully fetched Instagram profile HTML');
    
    if (!html.includes('edge_followed_by')) {
      console.log('Instagram profile data not found in HTML response');
      return {};
    }
    
    const stats = extractInstagramStats(html);
    console.log('Extracted Instagram stats:', stats);
    
    // Only return stats that have actual values
    const cleanedStats: SocialMediaStats = {};
    
    if (stats.followers !== null && stats.followers !== undefined) {
      cleanedStats.followers = stats.followers;
    }
    
    if (stats.following !== null && stats.following !== undefined) {
      cleanedStats.following = stats.following;
    }
    
    if (stats.posts !== null && stats.posts !== undefined) {
      cleanedStats.posts = stats.posts;
    }
    
    if (stats.bio) {
      cleanedStats.bio = stats.bio;
    }
    
    if (stats.isPrivate !== null && stats.isPrivate !== undefined) {
      cleanedStats.isPrivate = stats.isPrivate;
    }

    return cleanedStats;
  } catch (error) {
    console.error('Error scanning Instagram profile:', error);
    return {};
  }
}