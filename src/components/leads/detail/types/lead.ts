import { Platform } from '@/config/platforms';
import { Tables } from '@/integrations/supabase/types';
import { SocialMediaPost } from '@/integrations/supabase/types/social-media';

export interface Note {
  id: string;
  content: string;
  created_at: string;
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
  };
  status?: string;
}

export interface LeadWithRelations {
  id: string;
  platform: Platform;
  tasks?: Tables<"tasks">[];
  messages?: Tables<"messages">[];
  lead_files?: Tables<"lead_files">[];
  linkedin_posts?: Tables<"linkedin_posts">[];
  social_media_posts?: SocialMediaPost[];
  notes: Note[];
  [key: string]: any; // Erlaubt zusätzliche Properties aus der leads Tabelle
}