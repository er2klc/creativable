import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { Json } from "@/integrations/supabase/types/auth";

export type Note = {
  id: string;
  content: string;
  created_at: string;
  color: string;
  lead_id: string;
  updated_at: string;
  user_id: string;
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
  };
  status?: string;
};

export type PostType = "image" | "video" | "carousel" | "text" | "sidecar";

export type SocialMediaPost = {
  id: string;
  lead_id: string;
  platform: string;
  type: string;
  post_type: PostType;
  content: string;
  likes_count?: number;
  comments_count?: number;
  url: string;
  posted_at: string;
  created_at: string;
  media_urls: string[];
  media_type?: string;
  video_url?: string;
  taggedUsers?: any[];
  timestamp?: string;
  caption?: string;
  location?: string;
};

export type SocialMediaPostRaw = SocialMediaPost;

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes" | "social_media_posts"> {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Note[];
  lead_files: Tables<"lead_files">[];
  linkedin_posts?: any[];
  social_media_posts?: SocialMediaPost[];
}

export type TimelineItemType = "task" | "note" | "phase_change" | "file_upload" | "contact_created" | "message" | "appointment";

export type TimelineItemStatus = "completed" | "cancelled" | "outdated" | undefined;

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  created_at: string;
  timestamp: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: TimelineItemStatus;
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    color?: string;
    meetingType?: string;
    oldStatus?: string;
    newStatus?: string;
    type?: string;
  };
  platform?: string;
  status?: string;
}