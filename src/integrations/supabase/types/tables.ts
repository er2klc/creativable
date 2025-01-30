import { Message, MessageInsert, MessageUpdate } from './messages';
import { Settings, SettingsInsert, SettingsUpdate } from './settings';
import { Json } from './auth';

export interface Tables {
  settings: {
    Row: Settings;
    Insert: SettingsInsert;
    Update: SettingsUpdate;
  };
  chatbot_settings: {
    Row: {
      id: string;
      user_id: string;
      openai_api_key: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      user_id: string;
      openai_api_key?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      user_id?: string;
      openai_api_key?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Relationships: [];
  };
  documents: {
    Row: {
      created_at: string | null;
      file_path: string;
      file_type: string;
      filename: string;
      id: string;
      user_id: string;
    };
    Insert: {
      created_at?: string | null;
      file_path: string;
      file_type: string;
      filename: string;
      id?: string;
      user_id: string;
    };
    Update: {
      created_at?: string | null;
      file_path?: string | null;
      file_type?: string;
      filename?: string;
      id?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  keywords: {
    Row: {
      created_at: string | null;
      id: string;
      keyword: string;
      user_id: string;
    };
    Insert: {
      created_at?: string | null;
      id?: string;
      keyword: string;
      user_id: string;
    };
    Update: {
      created_at?: string | null;
      id?: string;
      keyword: string;
      user_id: string;
    };
    Relationships: [];
  };

  leads: {
    Row: {
      id: string;
      user_id: string;
      name: string;
      platform: string;
      industry: string;
      last_action: string | null;
      last_action_date: string | null;
      created_at: string | null;
      updated_at: string | null;
      notes: string | null;
      social_media_username: string | null;
      company_name: string | null;
      usp: string | null;
      phone_number: string | null;
      email: string | null;
      contact_type: string | null;
      social_media_raw_data: Json | null;  // Updated from social_media_posts
      social_media_interests: string[] | null;
      social_media_bio: string | null;
      last_social_media_scan: string | null;
      pipeline_id: string;
      phase_id: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      name: string;
      platform: string;
      industry: string;
      last_action?: string | null;
      last_action_date?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
      notes?: string | null;
      social_media_username?: string | null;
      company_name?: string | null;
      usp?: string | null;
      phone_number?: string;
      email?: string;
      contact_type?: string;
      social_media_raw_data?: Json | null;  // Updated from social_media_posts
      social_media_interests?: string[] | null;
      social_media_bio?: string | null;
      last_social_media_scan?: string | null;
      pipeline_id: string;
      phase_id: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      name?: string;
      platform?: string;
      industry?: string;
      last_action?: string | null;
      last_action_date?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
      notes?: string | null;
      social_media_username?: string | null;
      company_name?: string | null;
      usp?: string | null;
      phone_number?: string;
      email?: string;
      contact_type?: string;
      social_media_raw_data?: Json | null;  // Updated from social_media_posts
      social_media_interests?: string[] | null;
      social_media_bio?: string | null;
      last_social_media_scan?: string | null;
      pipeline_id?: string;
      phase_id?: string;
    };
  };

  messages: {
    Row: Message;
    Insert: MessageInsert;
    Update: MessageUpdate;
    Relationships: [
      {
        foreignKeyName: "messages_lead_id_fkey";
        columns: ["lead_id"];
        isOneToOne: false;
        referencedRelation: "leads";
        referencedColumns: ["id"];
      },
    ];
  };
  tasks: {
    Row: {
      completed: boolean | null;
      created_at: string | null;
      due_date: string | null;
      id: string;
      lead_id: string | null;
      title: string;
      user_id: string;
    };
    Insert: {
      completed?: boolean | null;
      created_at?: string | null;
      due_date?: string | null;
      id?: string;
      lead_id?: string | null;
      title: string;
      user_id: string;
    };
    Update: {
      completed?: boolean | null;
      created_at?: string | null;
      due_date?: string | null;
      id?: string;
      lead_id?: string | null;
      title?: string;
      user_id?: string;
    };
    Relationships: [
      {
        foreignKeyName: "tasks_lead_id_fkey";
        columns: ["lead_id"];
        isOneToOne: false;
        referencedRelation: "leads";
        referencedColumns: ["id"];
      },
    ];
  };
  pipeline_phases: {
    Row: {
      id: string;
      pipeline_id: string;
      name: string;
      order_index: number;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      pipeline_id: string;
      name: string;
      order_index?: number;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      pipeline_id: string;
      name?: string;
      order_index?: number;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Relationships: [
      {
        foreignKeyName: "pipeline_phases_pipeline_id_fkey";
        columns: ["pipeline_id"];
        isOneToOne: false;
        referencedRelation: "pipelines";
        referencedColumns: ["id"];
      }
    ];
  };

  social_media_scan_history: {
    Row: {
      id: string;
      lead_id: string | null;
      platform: string;
      scanned_at: string | null;
      followers_count: number | null;
      following_count: number | null;
      posts_count: number | null;
      engagement_rate: number | null;
      success: boolean | null;
      error_message: string | null;
      profile_data: Json | null;
      experience: Json | null;
      education: Json | null;
      skills: Json | null;
      certifications: Json | null;
      languages: Json | null;
      recommendations: Json | null;
    };
    Insert: {
      id?: string;
      lead_id?: string | null;
      platform: string;
      scanned_at?: string | null;
      followers_count?: number | null;
      following_count?: number | null;
      posts_count?: number | null;
      engagement_rate?: number | null;
      success?: boolean | null;
      error_message?: string | null;
      profile_data?: Json | null;
      experience?: Json | null;
      education?: Json | null;
      skills?: Json | null;
      certifications?: Json | null;
      languages?: Json | null;
      recommendations?: Json | null;
    };
    Update: {
      id?: string;
      lead_id?: string | null;
      platform?: string;
      scanned_at?: string | null;
      followers_count?: number | null;
      following_count?: number | null;
      posts_count?: number | null;
      engagement_rate?: number | null;
      success?: boolean | null;
      error_message?: string | null;
      profile_data?: Json | null;
      experience?: Json | null;
      education?: Json | null;
      skills?: Json | null;
      certifications?: Json | null;
      languages?: Json | null;
      recommendations?: Json | null;
    };
  };
}
