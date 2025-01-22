import { Tables } from "@/integrations/supabase/types";

export interface SocialMediaPost {
  id: string;
  lead_id: string;
  platform: string;
  post_type: string;
  content: string;
  likes_count: number;
  comments_count: number;
  url: string;
  location: string;
  mentioned_profiles: string[];
  tagged_profiles: string[];
  posted_at: string;
  created_at: string;
  metadata: any;
  engagement_count: number;
  first_comment: string;
  media_type: string;
  media_urls: string[];
  tagged_users: string[];
}

export interface LeadWithRelations extends Tables<"leads"> {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  social_media_posts?: SocialMediaPost[];
}