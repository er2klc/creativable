import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function saveLinkedInData(
  supabaseClient: any,
  leadId: string,
  scanHistory: any,
  leadData: any,
  linkedinPosts: any[]
) {
  console.log('Starting LinkedIn data save operation for lead:', leadId);

  try {
    // Save scan history
    const { error: scanError } = await supabaseClient
      .from('social_media_scan_history')
      .insert(scanHistory);

    if (scanError) {
      console.error('Error storing scan history:', scanError);
      throw scanError;
    }

    // Save LinkedIn posts if available
    if (linkedinPosts.length > 0) {
      console.log('Saving LinkedIn posts:', linkedinPosts.length);
      
      const { error: postsError } = await supabaseClient
        .from('linkedin_posts')
        .upsert(linkedinPosts, {
          onConflict: 'id'
        });

      if (postsError) {
        console.error('Error storing LinkedIn posts:', postsError);
        throw postsError;
      }
    }

    // Update lead data
    console.log('Updating lead data:', leadData);
    const { error: leadUpdateError } = await supabaseClient
      .from('leads')
      .update(leadData)
      .eq('id', leadId);

    if (leadUpdateError) {
      console.error('Error updating lead:', leadUpdateError);
      throw leadUpdateError;
    }

    console.log('Successfully saved LinkedIn data for lead:', leadId);
  } catch (error) {
    console.error('Error in saveLinkedInData:', error);
    throw error;
  }
}