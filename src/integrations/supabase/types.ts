export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          apify_instagram_data: Json | null
          created_at: string
          email: string | null
          id: string
          is_favorite: boolean | null
          last_social_media_scan: string | null
          name: string
          notes: string | null
          phone: string | null
          pipeline_stage_id: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          social_media_bio: string | null
          social_media_categories: string[] | null
          social_media_engagement_rate: number | null
          social_media_followers: number | null
          social_media_following: number | null
          social_media_interests: string[] | null
          social_media_profile_image_url: string | null
          social_media_username: string | null
          social_media_verified: boolean | null
          status: Database["public"]["Enums"]["contact_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apify_instagram_data?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_social_media_scan?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          pipeline_stage_id?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          social_media_bio?: string | null
          social_media_categories?: string[] | null
          social_media_engagement_rate?: number | null
          social_media_followers?: number | null
          social_media_following?: number | null
          social_media_interests?: string[] | null
          social_media_profile_image_url?: string | null
          social_media_username?: string | null
          social_media_verified?: boolean | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apify_instagram_data?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_social_media_scan?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          pipeline_stage_id?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          social_media_bio?: string | null
          social_media_categories?: string[] | null
          social_media_engagement_rate?: number | null
          social_media_followers?: number | null
          social_media_following?: number | null
          social_media_interests?: string[] | null
          social_media_profile_image_url?: string | null
          social_media_username?: string | null
          social_media_verified?: boolean | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_leads_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          pipeline_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          pipeline_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          pipeline_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          partner_code: string | null
          phone: string | null
          subscription_plan: string | null
          team_name: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          partner_code?: string | null
          phone?: string | null
          subscription_plan?: string | null
          team_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          partner_code?: string | null
          phone?: string | null
          subscription_plan?: string | null
          team_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      timeline_entries: {
        Row: {
          contact_id: string
          created_at: string
          description: string | null
          event_timestamp: string
          icon: string
          id: string
          importance: string | null
          metadata: Json | null
          status: string | null
          title: string
          tool_data: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          description?: string | null
          event_timestamp?: string
          icon?: string
          id?: string
          importance?: string | null
          metadata?: Json | null
          status?: string | null
          title: string
          tool_data?: Json | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          description?: string | null
          event_timestamp?: string
          icon?: string
          id?: string
          importance?: string | null
          metadata?: Json | null
          status?: string | null
          title?: string
          tool_data?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_entries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_pipeline_for_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "team_leader" | "partner" | "member" | "guest"
      contact_status:
        | "lead"
        | "customer"
        | "partner"
        | "not_for_now"
        | "no_interest"
      lead_status:
        | "lead"
        | "warm"
        | "hot"
        | "customer"
        | "partner"
        | "not_for_now"
        | "no_interest"
      social_platform: "Instagram" | "LinkedIn" | "WhatsApp" | "Email" | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "team_leader", "partner", "member", "guest"],
      contact_status: [
        "lead",
        "customer",
        "partner",
        "not_for_now",
        "no_interest",
      ],
      lead_status: [
        "lead",
        "warm",
        "hot",
        "customer",
        "partner",
        "not_for_now",
        "no_interest",
      ],
      social_platform: ["Instagram", "LinkedIn", "WhatsApp", "Email", "Other"],
    },
  },
} as const
