import { PostType, RecurringPattern, ShortcutType, CommunicationChannel, GenderType } from '@/types/leads';
import { Json } from './json';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  industry: string;
  email?: string | null;
  phone_number?: string | null;
  status?: string;
  pipeline_id: string;
  phase_id: string;
  created_at?: string;
  updated_at?: string;
  social_media_username?: string | null;
  social_media_posts?: Json | null;
  social_media_followers?: number | null;
  social_media_following?: number | null;
  social_media_engagement_rate?: number | null;
  social_media_profile_image_url?: string | null;
}

export interface SocialMediaPost {
  id: string;
  user_id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string | null;
  url: string | null;
  media_urls?: string[];
  media_type?: string | null;
  posted_at?: string | null;
  created_at?: string;
  // ... andere Social Media Post Felder
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  created_by: string;
  max_members?: number;
  join_code?: string | null;
  logo_url?: string | null;
  order_index?: number;
  slug: string;
  video_url?: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
}

export interface Platform {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  created_by: string;
  invite_code?: string | null;
  logo_url?: string | null;
  linked_modules?: string[] | null;
  image_url?: string | null;
  slug?: string | null;
}

export interface PlatformModule {
  id: string;
  platform_id: string;
  title: string;
  description?: string | null;
  order_index?: number;
  created_at?: string;
  created_by: string;
  module_order?: number;
}

export interface Profile {
  id: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  email?: string | null;
  display_name?: string | null;
  is_super_admin?: boolean;
  avatar_url?: string | null;
}

export interface Database {
  public: {
    Tables: {
      leads: Lead;
      teams: Team;
      profiles: Profile;
      // ... andere Tabellen
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
          user_id: string;
        };
        Returns: {
          id: string;
          content: string;
          similarity: number;
          document_id: string;
          document_title: string;
          source_type: string;
        }[];
      };
      // ... andere Funktionen
    };
    Enums: {
      post_type: PostType;
      recurring_pattern: RecurringPattern;
      shortcut_type: ShortcutType;
      communication_channel: CommunicationChannel;
      gender_type: GenderType;
    };
  };
}

