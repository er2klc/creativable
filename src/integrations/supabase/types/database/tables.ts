import { Json } from '../json';
import { PostType, RecurringPattern, ShortcutType, CommunicationChannel, GenderType } from '../enums';

export interface Database {
  public: {
    Tables: {
      leads: Lead;
      teams: Team;
      profiles: Profile;
      messages: Message;
      tasks: Task;
      notes: Note;
      settings: Setting;
      chatbot_settings: ChatbotSetting;
      documents: Document;
      keywords: Keyword;
      lead_files: LeadFile;
      pipeline_phases: PipelinePhase;
      pipelines: Pipeline;
      social_media_posts: SocialMediaPost;
      social_media_scan_history: SocialMediaScanHistory;
      support_tickets: SupportTicket;
      team_members: TeamMember;
      tree_links: TreeLink;
      tree_profiles: TreeProfile;
      user_documents: UserDocument;
      user_signatures: UserSignature;
      vision_boards: VisionBoard;
      vision_board_images: VisionBoardImage;
    };
    Views: {
      [_ in never]: never
    };
    Functions: DatabaseFunctions;
    Enums: DatabaseEnums;
  };
}

export interface DatabaseFunctions {
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
  match_content: {
    Args: {
      query_embedding: string;
      match_threshold: number;
      match_count: number;
      search_content_type: string;
    };
    Returns: {
      id: string;
      content: string;
      similarity: number;
      metadata: Json;
      team_id: string;
    }[];
  };
  generate_join_code: {
    Args: Record<PropertyKey, never>;
    Returns: string;
  };
  generate_unique_slug: {
    Args: {
      base_slug: string;
      table_name: string;
      existing_id?: string;
    };
    Returns: string;
  };
  award_team_points: {
    Args: {
      p_team_id: string;
      p_user_id: string;
      p_event_type: string;
      p_points: number;
      p_metadata?: Json;
    };
    Returns: undefined;
  };
}

export interface DatabaseEnums {
  post_type: PostType;
  recurring_pattern: RecurringPattern;
  shortcut_type: ShortcutType;
  communication_channel: CommunicationChannel;
  gender_type: GenderType;
}

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
  apify_instagram_data?: Json | null;
  last_social_media_scan?: string | null;
  social_media_bio?: string | null;
  social_media_interests?: string[] | null;
  social_media_categories?: string[] | null;
  social_media_stats?: Json | null;
  social_media_verified?: boolean | null;
  social_media_posts_count?: number | null;
  social_media_mentioned_users?: Json | null;
  social_media_tagged_users?: Json | null;
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

export interface Message {
  id: string;
  lead_id?: string | null;
  user_id: string;
  content: string;
  platform: string;
  sent_at?: string | null;
  read: boolean;
}

export interface Task {
  id: string;
  lead_id?: string | null;
  user_id: string;
  title: string;
  due_date?: string | null;
  completed?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  cancelled?: boolean | null;
  color?: string | null;
  meeting_type?: string | null;
  order_index?: number | null;
  priority?: string | null;
}

export interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  color?: string | null;
  metadata?: Json | null;
}

export interface Setting {
  id: string;
  user_id: string;
  language?: string | null;
  openai_api_key?: string | null;
  whatsapp_number?: string | null;
  whatsapp_verified?: boolean | null;
  instagram_auth_token?: string | null;
  instagram_connected?: boolean | null;
  linkedin_auth_token?: string | null;
  linkedin_connected?: boolean | null;
  facebook_auth_token?: string | null;
  facebook_connected?: boolean | null;
  tiktok_auth_token?: string | null;
  tiktok_connected?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  company_name?: string | null;
  about_me?: string | null;
  business_description?: string | null;
  products_services?: string | null;
  target_audience?: string | null;
  usp?: string | null;
  registration_completed?: boolean | null;
  registration_step?: number | null;
  registration_company_name?: string | null;
  last_selected_pipeline_id?: string | null;
  default_message_template?: string | null;
  network_marketing_id?: string | null;
  instagram_app_id?: string | null;
  instagram_app_secret?: string | null;
  apify_api_key?: string | null;
  superchat_api_key?: string | null;
}