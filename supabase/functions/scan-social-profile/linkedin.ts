import { SocialMediaStats, extractLinkedInStats } from "../_shared/social-media-utils.ts";

export async function scanLinkedInProfile(username: string): Promise<SocialMediaStats> {
  console.log('Scanning LinkedIn profile for:', username);
  
  try {
    const response = await fetch(`https://www.linkedin.com/in/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.statusText}`);
    }

    const html = await response.text();
    return extractLinkedInStats(html);
  } catch (error) {
    console.error('Error scanning LinkedIn profile:', error);
    return {};
  }
}