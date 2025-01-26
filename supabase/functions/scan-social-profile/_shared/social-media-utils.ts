export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface SocialMediaStats {
  bio?: string | null;
  followers?: number | null;
  following?: number | null;
  posts?: number | null;
  connections?: number | null;
  isPrivate?: boolean | null;
  headline?: string | null;
  name?: string | null;
  company_name?: string | null;
  position?: string | null;
}

export const extractInstagramStats = (html: string): SocialMediaStats => {
  try {
    // Try multiple patterns for bio extraction
    let bio = null;
    const bioPatterns = [
      /"biography":"([^"]+)"/,
      /<meta property="og:description" content="([^"]+)"/,
      /biography\\?":\\?"([^"\\]+)\\?"/
    ];
    
    for (const pattern of bioPatterns) {
      const match = html.match(pattern);
      if (match) {
        bio = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => 
            String.fromCharCode(parseInt(code, 16))
          );
        break;
      }
    }

    // Try multiple patterns for stats
    const statsPatterns = {
      followers: [
        /"edge_followed_by":\{"count":(\d+)\}/,
        /Followers:\s*([0-9,]+)/,
        /followers\\?":\\?"(\d+)\\?"/
      ],
      following: [
        /"edge_follow":\{"count":(\d+)\}/,
        /Following:\s*([0-9,]+)/,
        /following\\?":\\?"(\d+)\\?"/
      ],
      posts: [
        /"edge_owner_to_timeline_media":\{"count":(\d+)\}/,
        /Posts:\s*([0-9,]+)/,
        /media\\?":\\?"(\d+)\\?"/
      ]
    };

    const stats: SocialMediaStats = {};
    
    if (bio) {
      stats.bio = bio;
      console.log('Found bio:', bio);
    }

    // Extract numeric stats using multiple patterns
    for (const [key, patterns] of Object.entries(statsPatterns)) {
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          const value = parseInt(match[1].replace(/,/g, ''));
          if (!isNaN(value)) {
            stats[key as keyof SocialMediaStats] = value;
            console.log(`Found ${key}:`, value);
            break;
          }
        }
      }
    }

    // Try multiple patterns for private account status
    const privatePatterns = [
      /"is_private":(\w+)/,
      /Private account/i,
      /is_private\\?":\\?"(\w+)\\?"/
    ];

    for (const pattern of privatePatterns) {
      const match = html.match(pattern);
      if (match) {
        stats.isPrivate = match[1] === 'true' || match[1] === 'True' || !!match[1];
        console.log('Found isPrivate:', stats.isPrivate);
        break;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error extracting Instagram stats:', error);
    return {};
  }
};
