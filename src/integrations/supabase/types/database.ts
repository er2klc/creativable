import { Settings, SettingsInsert, SettingsUpdate } from './settings';
import { Json } from './auth';

export type Database = {
  public: {
    Tables: {
      settings: {
        Row: Settings;
        Insert: SettingsInsert;
        Update: SettingsUpdate;
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
          file_path?: string;
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
          industry: string;
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
          industry: string;
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
          industry?: string;
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
      message_templates: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          id: string;
          lead_id: string | null;
          platform: string;
          sent_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          id?: string;
          lead_id?: string | null;
          platform: string;
          sent_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          id?: string;
          lead_id?: string | null;
          platform?: string;
          sent_at?: string | null;
          user_id?: string;
        };
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;
