import { Platform } from '@/config/platforms';
import { Tables } from '@/integrations/supabase/types';
import { SocialMediaPost } from '@/integrations/supabase/types/social-media';
import { Json } from '@/integrations/supabase/types';

/**
 * Base Lead type directly from the database table
 */
export type BaseLead = Tables<'leads'>;

/**
 * Note with metadata for phase changes
 */
export interface Note extends Omit<Tables<'notes'>, 'metadata'> {
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
  };
}

/**
 * Lead with all possible relations
 * This extends the base lead type and adds optional related records
 */
export interface LeadWithRelations extends BaseLead {
  // Platform information
  platform: Platform;
  
  // Related records
  tasks?: Tables<'tasks'>[];
  messages?: Tables<'messages'>[];
  notes: Note[];
  lead_files?: Tables<'lead_files'>[];
  
  // Social media related
  linkedin_posts?: Tables<'linkedin_posts'>[];
  social_media_posts?: SocialMediaPost[];
  
  // Tree structure
  parent_id?: string | null;
  level?: number | null;
  
  // Additional fields
  avatar_url?: string | null;
}