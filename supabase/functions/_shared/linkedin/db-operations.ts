import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function saveLinkedInData(
  supabaseClient: any,
  leadId: string,
  scanHistory: any,
  leadData: any,
  posts: any[]
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

    // Update lead data - only update non-null values
    const cleanLeadData = Object.fromEntries(
      Object.entries(leadData).filter(([_, v]) => v != null)
    );

    const { error: leadUpdateError } = await supabaseClient
      .from('leads')
      .update(cleanLeadData)
      .eq('id', leadId);

    if (leadUpdateError) {
      console.error('Error updating lead:', leadUpdateError);
      throw leadUpdateError;
    }

    // Save posts if available
    if (posts.length > 0) {
      const { error: postsError } = await supabaseClient
        .from('linkedin_posts')
        .upsert(posts, {
          onConflict: 'id'
        });

      if (postsError) {
        console.error('Error storing LinkedIn posts:', postsError);
        throw postsError;
      }
    }

    console.log('Successfully saved LinkedIn data for lead:', leadId);
  } catch (error) {
    console.error('Error in saveLinkedInData:', error);
    throw error;
  }
}