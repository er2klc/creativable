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
      keyword?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  leads: {
    Row: {
      business_description: string | null;
      company_name: string | null;
      created_at: string | null;
      id: string;
      contact_type: "Partner" | "Kunde" | null;
      last_action: string | null;
      last_action_date: string | null;
      name: string;
      notes: string | null;
      phase: string;
      platform: string;
      products_services: string | null;
      social_media_username: string | null;
      target_audience: string | null;
      updated_at: string | null;
      user_id: string;
      usp: string | null;
    };
    Insert: {
      business_description?: string | null;
      company_name?: string | null;
      created_at?: string | null;
      id?: string;
      contact_type?: "Partner" | "Kunde" | null;
      last_action?: string | null;
      last_action_date?: string | null;
      name: string;
      notes?: string | null;
      phase?: string;
      platform: string;
      products_services?: string | null;
      social_media_username?: string | null;
      target_audience?: string | null;
      updated_at?: string | null;
      user_id: string;
      usp?: string | null;
    };
    Update: {
      business_description?: string | null;
      company_name?: string | null;
      created_at?: string | null;
      id?: string;
      contact_type?: "Partner" | "Kunde" | null;
      last_action?: string | null;
      last_action_date?: string | null;
      name?: string;
      notes?: string | null;
      phase?: string;
      platform?: string;
      products_services?: string | null;
      social_media_username?: string | null;
      target_audience?: string | null;
      updated_at?: string | null;
      user_id?: string;
      usp?: string | null;
    };
    Relationships: [];
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
      user_id: string;
    };
    Insert: {
      id?: string;
      pipeline_id: string;
      name: string;
      order_index?: number;
      created_at?: string | null;
      updated_at?: string | null;
      user_id: string;
    };
    Update: {
      id?: string;
      pipeline_id?: string;
      name?: string;
      order_index?: number;
      created_at?: string | null;
      updated_at?: string | null;
      user_id?: string;
    };
  };
}
