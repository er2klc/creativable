export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface SocialMediaStats {
  followers?: number | null;
  following?: number | null;
  posts?: number | null;
  bio?: string | null;
  isPrivate?: boolean | null;
  connections?: number | null;
  headline?: string | null;
}

export const extractInstagramStats = (html: string): SocialMediaStats => {
  try {
    // Look for the bio first as it's important
    const bioMatch = html.match(/"biography":"([^"]+)"/);
    const bio = bioMatch ? bioMatch[1].replace(/\\n/g, '\n').replace(/\\u[0-9a-fA-F]{4}/g, match => 
      String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
    ) : null;

    // Extract other stats using more robust regex patterns
    const followersMatch = html.match(/"edge_followed_by":\{"count":(\d+)\}/);
    const followingMatch = html.match(/"edge_follow":\{"count":(\d+)\}/);
    const postsMatch = html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)\}/);
    const isPrivateMatch = html.match(/"is_private":(\w+)/);

    // Only include stats that were successfully extracted
    const stats: SocialMediaStats = {};
    
    if (bio) {
      stats.bio = bio;
      console.log('Found bio:', bio);
    }
    
    if (followersMatch && !isNaN(parseInt(followersMatch[1]))) {
      stats.followers = parseInt(followersMatch[1]);
      console.log('Found followers:', stats.followers);
    }
    
    if (followingMatch && !isNaN(parseInt(followingMatch[1]))) {
      stats.following = parseInt(followingMatch[1]);
      console.log('Found following:', stats.following);
    }
    
    if (postsMatch && !isNaN(parseInt(postsMatch[1]))) {
      stats.posts = parseInt(postsMatch[1]);
      console.log('Found posts:', stats.posts);
    }
    
    if (isPrivateMatch) {
      stats.isPrivate = isPrivateMatch[1] === 'true';
      console.log('Found isPrivate:', stats.isPrivate);
    }

    return stats;
  } catch (error) {
    console.error('Error extracting Instagram stats:', error);
    return {};
  }
};

export const extractLinkedInStats = (html: string): SocialMediaStats => {
  try {
    const connectionsMatch = html.match(/(\d+)\s+connections?/i);
    const headlineMatch = html.match(/<div class="text-body-medium break-words">(.*?)<\/div>/);
    const postsMatch = html.match(/(\d+)\s+posts?/i);
    const bioMatch = html.match(/<div class="pv-shared-text-with-see-more[^>]*>(.*?)<\/div>/);

    console.log('Extracted LinkedIn stats:', {
      connections: connectionsMatch?.[1] || 'Not found',
      headline: headlineMatch?.[1] || 'Not found',
      posts: postsMatch?.[1] || 'Not found',
      bio: bioMatch?.[1] || 'Not found'
    });

    return {
      connections: connectionsMatch ? parseInt(connectionsMatch[1]) : null,
      headline: headlineMatch ? headlineMatch[1].trim() : null,
      posts: postsMatch ? parseInt(postsMatch[1]) : null,
      bio: bioMatch ? bioMatch[1].trim() : null,
    };
  } catch (error) {
    console.error('Error extracting LinkedIn stats:', error);
    return {};
  }
};