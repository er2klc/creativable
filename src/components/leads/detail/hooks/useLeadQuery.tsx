import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithRelations } from "../types/lead";

export function useLeadQuery(leadId: string | null) {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) throw new Error("No lead ID provided");

      const { data: lead, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages (*),
          tasks (*),
          notes (*),
          lead_files (*),
          social_media_posts (*),
          linkedin_posts (*)
        `)
        .eq("id", leadId)
        .single();

      if (error) throw error;

      // Convert social_media_raw_data to social_media_posts if it exists
      if (lead.social_media_raw_data) {
        const rawData = lead.social_media_raw_data;
        lead.social_media_posts = Array.isArray(rawData) 
          ? rawData.map(post => ({
              ...post,
              bucket_path: post.bucket_path || null,
              comments_count: post.comments_count || 0,
              content: post.content || null,
              created_at: post.created_at || new Date().toISOString(),
              current_file: post.current_file || null,
              engagement_count: post.engagement_count || 0,
              error_message: post.error_message || null,
              first_comment: post.first_comment || null,
              hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
              id: post.id || '',
              lead_id: post.lead_id || null,
              likes_count: post.likes_count || 0,
              local_media_paths: Array.isArray(post.local_media_paths) ? post.local_media_paths : [],
              local_media_urls: Array.isArray(post.local_media_urls) ? post.local_media_urls : [],
              local_video_path: post.local_video_path || null,
              location: post.location || null,
              media_processing_status: post.media_processing_status || 'pending',
              media_type: post.media_type || null,
              media_urls: Array.isArray(post.media_urls) ? post.media_urls : [],
              mentioned_profiles: Array.isArray(post.mentioned_profiles) ? post.mentioned_profiles : [],
              metadata: post.metadata || {},
              platform: post.platform || 'Instagram',
              post_type: post.post_type || 'post',
              posted_at: post.posted_at || null,
              processing_progress: post.processing_progress || 0,
              storage_status: post.storage_status || 'pending',
              tagged_profiles: Array.isArray(post.tagged_profiles) ? post.tagged_profiles : [],
              tagged_users: Array.isArray(post.tagged_users) ? post.tagged_users : [],
              url: post.url || null,
              video_url: post.video_url || null
            }))
          : [];
      }

      return lead as LeadWithRelations;
    },
    enabled: !!leadId,
  });
}