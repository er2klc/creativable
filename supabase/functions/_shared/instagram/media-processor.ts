import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { InstagramPost, ProcessingState } from '../types/instagram.ts';

export async function processMediaFiles(
  posts: InstagramPost[],
  leadId: string,
  supabaseClient: ReturnType<typeof createClient>,
  updateProgress: (state: ProcessingState) => Promise<void>
): Promise<void> {
  console.log('Starting media processing for posts:', posts.length);
  
  for (const post of posts) {
    try {
      let mediaUrls: string[] = [];
      
      // Für Image Posts
      if (post.type === 'Image' && post.displayUrl) {
        console.log('Processing Image post:', post.id);
        mediaUrls = [post.displayUrl];
      }
      // Für Sidecar Posts
      else if (post.type === 'Sidecar' && post.media_urls && post.media_urls.length > 0) {
        console.log('Processing Sidecar post:', post.id);
        mediaUrls = post.media_urls;
      }
      
      if (mediaUrls.length === 0) {
        console.log('No valid media URLs found for post:', post.id);
        continue;
      }

      console.log('Processing media for post:', {
        postId: post.id,
        type: post.type,
        mediaUrls: mediaUrls
      });

      const response = await supabaseClient.functions.invoke('process-instagram-media', {
        body: {
          mediaUrls,
          leadId,
          postId: post.id
        }
      });

      if (!response.data?.success) {
        throw new Error(`Failed to process media: ${response.data?.error || 'Unknown error'}`);
      }

      console.log('Successfully processed media for post:', post.id);

    } catch (error) {
      console.error('Error processing post:', error);
    }
  }

  console.log('Media processing completed');
}