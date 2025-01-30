import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { InstagramPost, ProcessingState } from '../types/instagram.ts';

export async function processMediaFiles(
  posts: InstagramPost[],
  leadId: string,
  supabaseClient: ReturnType<typeof createClient>,
  updateProgress: (state: ProcessingState) => Promise<void>
): Promise<void> {
  console.log('Starting media processing for posts:', posts.length);
  
  const totalFiles = posts.reduce((sum, post) => {
    const mediaCount = post.media_urls?.length || 
                      (post.displayUrl ? 1 : 0) || 
                      (post.videoUrl ? 1 : 0) || 
                      0;
    console.log(`Post ${post.id} has ${mediaCount} media files`);
    return sum + mediaCount;
  }, 0);

  console.log(`Total files to process: ${totalFiles}`);
  
  let processedFiles = 0;

  for (const post of posts) {
    try {
      // Get all possible media URLs
      const mediaUrls = [
        ...(post.media_urls || []),
        post.displayUrl,
        post.videoUrl
      ].filter(Boolean) as string[];

      console.log(`Processing ${mediaUrls.length} media files for post ${post.id}`);

      if (mediaUrls.length === 0) {
        console.log('No media URLs found for post:', post.id);
        continue;
      }

      for (const mediaUrl of mediaUrls) {
        try {
          processedFiles++;
          console.log(`Processing media ${processedFiles}/${totalFiles}: ${mediaUrl}`);

          await updateProgress({
            totalFiles,
            processedFiles,
            currentFile: `Processing ${mediaUrl.split('/').pop()}`
          });

          const response = await supabaseClient.functions.invoke('process-instagram-media', {
            body: {
              mediaUrl,
              leadId,
              postId: post.id
            }
          });

          console.log('Media processing response:', response);

          if (!response.data?.success) {
            throw new Error(`Failed to process media: ${response.data?.error || 'Unknown error'}`);
          }

          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error processing media file:', error);
          await updateProgress({
            totalFiles,
            processedFiles,
            currentFile: mediaUrl,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch (error) {
      console.error('Error processing post:', error);
    }
  }

  console.log('Media processing completed');
  await updateProgress({
    totalFiles,
    processedFiles: totalFiles,
    currentFile: 'All media processed successfully'
  });
}