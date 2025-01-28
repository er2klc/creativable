import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { InstagramPost, ProcessingState } from '../types/instagram.ts';

export async function downloadAndUploadImage(
  imageUrl: string | undefined,
  supabaseClient: ReturnType<typeof createClient>,
  leadId: string
): Promise<string | null> {
  try {
    if (!imageUrl) return null;

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const imageBuffer = await response.arrayBuffer();
    const fileExt = 'jpg';
    const fileName = `${leadId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabaseClient
      .storage
      .from('contact-avatars')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('contact-avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

export async function processMediaFiles(
  posts: InstagramPost[],
  leadId: string,
  supabaseClient: ReturnType<typeof createClient>,
  updateProgress: (state: ProcessingState) => Promise<void>
): Promise<void> {
  const totalFiles = posts.reduce((sum, post) => 
    sum + (post.media_urls?.length || 0), 0);

  console.log(`Starting media processing for ${totalFiles} files`);
  
  let processedFiles = 0;

  for (const post of posts) {
    if (!post.media_urls || post.media_urls.length === 0) continue;

    for (const mediaUrl of post.media_urls) {
      try {
        processedFiles++;
        await updateProgress({
          totalFiles,
          processedFiles,
          currentFile: `Processing ${mediaUrl.split('/').pop()}`
        });

        console.log(`Processing media ${processedFiles}/${totalFiles}: ${mediaUrl}`);

        const response = await supabaseClient.functions.invoke('process-social-media', {
          body: {
            mediaUrl,
            leadId: post.lead_id,
            mediaType: post.media_type,
            postId: post.id,
            platform: 'Instagram'
          }
        });

        if (!response.data?.success) {
          throw new Error(`Failed to process media: ${response.data?.error || 'Unknown error'}`);
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error processing media:', error);
        await updateProgress({
          totalFiles,
          processedFiles,
          currentFile: mediaUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  await updateProgress({
    totalFiles,
    processedFiles: totalFiles,
    currentFile: 'All media processed successfully'
  });
}