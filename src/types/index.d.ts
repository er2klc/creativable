
import { Json } from '@/integrations/supabase/types';

// Define Lead interface with required properties
export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  lead_source?: string;
  platform: Platform;
  // Properties from error messages
  avatar_url?: string;
  display_name?: string;
  full_name?: string;
  job_title?: string;
  current_company_name?: string;
  city?: string;
  country?: string;
  website?: string;
  estimated_value?: number;
  contact_type?: string;
  linkedin_profile_name?: string;
  apify_instagram_data?: Json;
  social_media_posts?: SocialMediaPost[];
  pipeline?: any;
  phase?: any;
}

export interface LeadWithRelations extends Lead {
  messages: any[];
  tasks: any[];
  notes: any[];
  lead_files: any[];
  linkedin_posts?: any[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  lead_id: string;
  title: string;
  task?: string; // Make this optional to handle both cases
  completed: boolean;
  cancelled?: boolean;
  color?: string;
  created_at?: string;
  due_date?: string;
  meeting_type?: string;
  order_index?: number;
  priority?: string;
  type?: string;
  updated_at?: string;
  user_id: string;
}

export interface Settings {
  about_me: string;
  apify_api_key: string;
  business_description: string;
  company_name: string;
  created_at: string;
  default_message_template: string;
  email_configured: boolean;
  email_sync_enabled: boolean;
  last_selected_pipeline_id: string; // Added this required property
  // Add other fields as necessary
  whatsapp_verified: boolean;
}

export type Platform = 'Instagram' | 'LinkedIn' | 'Facebook' | 'TikTok' | 'Offline';

export interface YoutubeCardMetadata {
  title?: string;
  description?: string;
  expires_at?: string; // Added this property
  thumbnailUrl?: string;
  url?: string;
  videoId?: string;
}

export interface Locale {
  code: string;
  formatLong?: any;
  formatRelative?: any;
  formatDistance?: any;
  localize?: any;
  match?: any;
  options?: any;
}

export interface MessageTemplate {
  type: string;
  platform: string;
  structure: {
    greeting: string;
    introduction: string;
    main_content: string;
    call_to_action: string;
    closing: string;
  };
  rules: {
    max_length: number;
    tone: string;
    required_elements: string[];
  };
}
