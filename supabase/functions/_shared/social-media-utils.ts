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
    const bio = bioMatch ? bioMatch[1].replace(/\\n/g, '\n') : null;

    // Extract other stats using regex patterns
    const followersMatch = html.match(/"edge_followed_by":\{"count":(\d+)\}/);
    const followingMatch = html.match(/"edge_follow":\{"count":(\d+)\}/);
    const postsMatch = html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)\}/);
    const isPrivateMatch = html.match(/"is_private":(\w+)/);

    console.log('Extracted Instagram stats:', {
      bio: bio ? 'Found' : 'Not found',
      followers: followersMatch?.[1] || 'Not found',
      following: followingMatch?.[1] || 'Not found',
      posts: postsMatch?.[1] || 'Not found',
      isPrivate: isPrivateMatch?.[1] || 'Not found'
    });

    return {
      bio,
      followers: followersMatch ? parseInt(followersMatch[1]) : null,
      following: followingMatch ? parseInt(followingMatch[1]) : null,
      posts: postsMatch ? parseInt(postsMatch[1]) : null,
      isPrivate: isPrivateMatch ? isPrivateMatch[1] === 'true' : null,
    };
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