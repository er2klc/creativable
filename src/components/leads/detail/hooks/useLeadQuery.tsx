import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithRelations } from "../types/lead";
import { Json } from "@/integrations/supabase/types";

interface SocialMediaPost {
  bucket_path?: string | null;
  comments_count?: number;
  content?: string | null;
  created_at?: string;
  current_file?: string | null;
  engagement_count?: number;
  error_message?: string | null;
  first_comment?: string | null;
  hashtags?: string[];
  id?: string;
  lead_id?: string | null;
  likes_count?: number;
  local_media_paths?: string[];
  local_media_urls?: string[];
  local_video_path?: string | null;
  location?: string | null;
  media_processing_status?: string;
  media_type?: string | null;
  media_urls?: string[];
  mentioned_profiles?: string[];
  metadata?: Record<string, any>;
  platform?: string;
  post_type?: string;
  posted_at?: string | null;
  processing_progress?: number;
  storage_status?: string;
  tagged_profiles?: string[];
  tagged_users?: any[];
  url?: string | null;
  video_url?: string | null;
}

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
        const rawData = lead.social_media_raw_data as Json[];
        lead.social_media_posts = Array.isArray(rawData) 
          ? rawData.map((post: Json) => {
              const typedPost = post as unknown as SocialMediaPost;
              return {
                bucket_path: typedPost.bucket_path || null,
                comments_count: typedPost.comments_count || 0,
                content: typedPost.content || null,
                created_at: typedPost.created_at || new Date().toISOString(),
                current_file: typedPost.current_file || null,
                engagement_count: typedPost.engagement_count || 0,
                error_message: typedPost.error_message || null,
                first_comment: typedPost.first_comment || null,
                hashtags: Array.isArray(typedPost.hashtags) ? typedPost.hashtags : [],
                id: typedPost.id || '',
                lead_id: typedPost.lead_id || null,
                likes_count: typedPost.likes_count || 0,
                local_media_paths: Array.isArray(typedPost.local_media_paths) ? typedPost.local_media_paths : [],
                local_media_urls: Array.isArray(typedPost.local_media_urls) ? typedPost.local_media_urls : [],
                local_video_path: typedPost.local_video_path || null,
                location: typedPost.location || null,
                media_processing_status: typedPost.media_processing_status || 'pending',
                media_type: typedPost.media_type || null,
                media_urls: Array.isArray(typedPost.media_urls) ? typedPost.media_urls : [],
                mentioned_profiles: Array.isArray(typedPost.mentioned_profiles) ? typedPost.mentioned_profiles : [],
                metadata: typedPost.metadata || {},
                platform: typedPost.platform || 'Instagram',
                post_type: typedPost.post_type || 'post',
                posted_at: typedPost.posted_at || null,
                processing_progress: typedPost.processing_progress || 0,
                storage_status: typedPost.storage_status || 'pending',
                tagged_profiles: Array.isArray(typedPost.tagged_profiles) ? typedPost.tagged_profiles : [],
                tagged_users: Array.isArray(typedPost.tagged_users) ? typedPost.tagged_users : [],
                url: typedPost.url || null,
                video_url: typedPost.video_url || null
              };
            })
          : [];
      }

      return lead as LeadWithRelations;
    },
    enabled: !!leadId,
  });
}