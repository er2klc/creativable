import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function saveLinkedInData(
  supabaseClient: any,
  leadId: string,
  scanHistory: any,
  leadData: any,
  posts: any[]
) {
  // Save scan history
  const { error: scanError } = await supabaseClient
    .from('social_media_scan_history')
    .insert(scanHistory);

  if (scanError) {
    console.error('Error storing scan history:', scanError);
    throw scanError;
  }

  // Save posts if available
  if (posts.length > 0) {
    const postsToInsert = posts.map(post => ({
      id: post.id || `${leadId}-${Math.random().toString(36).substr(2, 9)}`,
      lead_id: leadId,
      content: post.text || '',
      url: post.url || null,
      media_urls: post.images || [],
      post_type: 'activity',
      reactions: post.statistics || {},
      metadata: post,
      posted_at: post.date ? new Date(post.date).toISOString() : new Date().toISOString()
    }));

    const { error: postsError } = await supabaseClient
      .from('linkedin_posts')
      .upsert(postsToInsert, {
        onConflict: 'id'
      });

    if (postsError) {
      console.error('Error storing LinkedIn posts:', postsError);
    }
  }

  // Update lead data
  const { error: leadUpdateError } = await supabaseClient
    .from('leads')
    .update(leadData)
    .eq('id', leadId);

  if (leadUpdateError) {
    console.error('Error updating lead:', leadUpdateError);
    throw leadUpdateError;
  }
}