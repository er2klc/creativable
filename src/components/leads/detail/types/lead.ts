import { Tables } from "@/integrations/supabase/types";

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";

export interface TaggedUser {
  id: string;
  username: string;
  full_name?: string;
  profile_pic_url: string;
  is_verified?: boolean;
}

export interface SocialMediaPostRaw {
  id: string;
  platform?: string;
  type?: string;
  post_type: PostType;
  content: string | null;
  caption?: string | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  likes_count?: number | null;
  comments_count?: number | null;
  url: string | null;
  location?: string | null;
  locationName?: string | null;
  mentioned_profiles?: string[] | null;
  tagged_profiles?: string[] | null;
  posted_at: string | null;
  timestamp?: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  video_url?: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  lead_id?: string;
  taggedUsers?: TaggedUser[];
  local_video_path?: string | null;
  local_media_paths?: string[] | null;
  kontaktIdFallback?: string;
}

export type LeadWithRelations = Tables<"leads"> & {
  notes?: Array<{
    id: string;
    content: string;
    created_at: string;
    metadata?: {
      type?: string;
    };
    status?: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    created_at: string;
    due_date?: string;
    completed?: boolean;
    cancelled?: boolean;
    updated_at?: string;
    color?: string;
    meeting_type?: string;
  }>;
  messages?: Array<{
    id: string;
    content: string;
    created_at: string;
    sent_at?: string;
    platform?: string;
  }>;
  lead_files?: Array<{
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
  }>;
  linkedin_posts?: any[];
  social_media_posts?: any[];
  stats?: {
    totalMembers: number;
    admins: number;
  };
}