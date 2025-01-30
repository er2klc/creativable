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
      // Nur displayUrl für Images und Sidecar verarbeiten
      const mediaUrl = post.displayUrl;
      
      if (!mediaUrl) {
        console.log('No displayUrl found for post:', post.id);
        continue;
      }

      console.log('Processing media for post:', {
        postId: post.id,
        mediaUrl: mediaUrl
      });

      const response = await supabaseClient.functions.invoke('process-instagram-media', {
        body: {
          mediaUrl,
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