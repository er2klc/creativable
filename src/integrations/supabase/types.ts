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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      changelog_entries: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          title: string
          type: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title: string
          type?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          type?: string | null
          version?: string
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          created_at: string | null
          id: string
          max_tokens: number | null
          model: string | null
          openai_api_key: string | null
          temperature: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          openai_api_key?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          openai_api_key?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_group_states: {
        Row: {
          created_at: string | null
          group_name: string
          id: string
          lead_id: string
          state: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_name: string
          id?: string
          lead_id: string
          state?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_name?: string
          id?: string
          lead_id?: string
          state?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_embeddings: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          file_path: string
          file_type: string
          filename: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_type: string
          filename: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_type?: string
          filename?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      elevate_lerninhalte: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          module_id: string
          submodule_order: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          module_id: string
          submodule_order?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          module_id?: string
          submodule_order?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elevate_lerninhalte_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "elevate_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      elevate_lerninhalte_documents: {
        Row: {
          created_at: string | null
          created_by: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          lerninhalte_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          lerninhalte_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          lerninhalte_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elevate_lerninhalte_documents_lerninhalte_id_fkey"
            columns: ["lerninhalte_id"]
            isOneToOne: false
            referencedRelation: "elevate_lerninhalte"
            referencedColumns: ["id"]
          },
        ]
      }
      elevate_lerninhalte_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lerninhalte_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lerninhalte_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lerninhalte_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elevate_lerninhalte_notes_lerninhalte_id_fkey"
            columns: ["lerninhalte_id"]
            isOneToOne: false
            referencedRelation: "elevate_lerninhalte"
            referencedColumns: ["id"]
          },
        ]
      }
      elevate_modules: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          order_index: number | null
          platform_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          order_index?: number | null
          platform_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          order_index?: number | null
          platform_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "elevate_modules_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "elevate_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      elevate_platforms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          invite_code: string | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          invite_code?: string | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          invite_code?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      elevate_team_access: {
        Row: {
          created_at: string | null
          granted_by: string
          id: string
          platform_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          granted_by: string
          id?: string
          platform_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          granted_by?: string
          id?: string
          platform_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elevate_team_access_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "elevate_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elevate_team_access_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      elevate_user_access: {
        Row: {
          access_type: string | null
          created_at: string | null
          granted_by: string
          id: string
          platform_id: string
          user_id: string
        }
        Insert: {
          access_type?: string | null
          created_at?: string | null
          granted_by: string
          id?: string
          platform_id: string
          user_id: string
        }
        Update: {
          access_type?: string | null
          created_at?: string | null
          granted_by?: string
          id?: string
          platform_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elevate_user_access_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "elevate_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      elevate_user_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          lerninhalte_id: string
          progress_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          lerninhalte_id: string
          progress_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          lerninhalte_id?: string
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elevate_user_progress_lerninhalte_id_fkey"
            columns: ["lerninhalte_id"]
            isOneToOne: false
            referencedRelation: "elevate_lerninhalte"
            referencedColumns: ["id"]
          },
        ]
      }
      email_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          path: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          path: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "email_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          content: string | null
          created_at: string | null
          flagged: boolean | null
          folder_id: string | null
          html_content: string | null
          id: string
          message_id: string
          read: boolean | null
          received_at: string | null
          recipient: string | null
          sender: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          flagged?: boolean | null
          folder_id?: string | null
          html_content?: string | null
          id?: string
          message_id: string
          read?: boolean | null
          received_at?: string | null
          recipient?: string | null
          sender?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          flagged?: boolean | null
          folder_id?: string | null
          html_content?: string | null
          id?: string
          message_id?: string
          read?: boolean | null
          received_at?: string | null
          recipient?: string | null
          sender?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "email_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_business_match: {
        Row: {
          analysis_result: Json | null
          created_at: string | null
          id: string
          lead_id: string
          match_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string | null
          id?: string
          lead_id: string
          match_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string | null
          id?: string
          lead_id?: string
          match_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_business_match_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          lead_id: string
          mime_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          lead_id: string
          mime_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          lead_id?: string
          mime_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_files_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          lead_id: string
          subscription_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lead_id: string
          subscription_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lead_id?: string
          subscription_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lead_summaries: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          summary: string | null
          summary_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          summary?: string | null
          summary_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          summary?: string | null
          summary_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lead_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          lead_id: string
          tag_name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          tag_name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          tag_name?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          apify_instagram_data: Json | null
          birth_date: string | null
          business_match: Json | null
          city: string | null
          company_name: string | null
          contact_type: string | null
          created_at: string | null
          current_company_name: string | null
          email: string | null
          experience: string | null
          id: string
          industry: string
          is_favorite: boolean | null
          languages: string[] | null
          last_action: string | null
          last_action_date: string | null
          name: string
          onboarding_progress: Json | null
          phase_id: string | null
          phase_name: string | null
          phone_number: string | null
          pipeline_id: string | null
          platform: string
          position: string | null
          region: string | null
          social_media_bio: string | null
          social_media_engagement_rate: number | null
          social_media_followers: number | null
          social_media_following: number | null
          social_media_interests: string[] | null
          social_media_profile_image_url: string | null
          social_media_username: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          apify_instagram_data?: Json | null
          birth_date?: string | null
          business_match?: Json | null
          city?: string | null
          company_name?: string | null
          contact_type?: string | null
          created_at?: string | null
          current_company_name?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          industry: string
          is_favorite?: boolean | null
          languages?: string[] | null
          last_action?: string | null
          last_action_date?: string | null
          name: string
          onboarding_progress?: Json | null
          phase_id?: string | null
          phase_name?: string | null
          phone_number?: string | null
          pipeline_id?: string | null
          platform: string
          position?: string | null
          region?: string | null
          social_media_bio?: string | null
          social_media_engagement_rate?: number | null
          social_media_followers?: number | null
          social_media_following?: number | null
          social_media_interests?: string[] | null
          social_media_profile_image_url?: string | null
          social_media_username?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          apify_instagram_data?: Json | null
          birth_date?: string | null
          business_match?: Json | null
          city?: string | null
          company_name?: string | null
          contact_type?: string | null
          created_at?: string | null
          current_company_name?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          industry?: string
          is_favorite?: boolean | null
          languages?: string[] | null
          last_action?: string | null
          last_action_date?: string | null
          name?: string
          onboarding_progress?: Json | null
          phase_id?: string | null
          phase_name?: string | null
          phone_number?: string | null
          pipeline_id?: string | null
          platform?: string
          position?: string | null
          region?: string | null
          social_media_bio?: string | null
          social_media_engagement_rate?: number | null
          social_media_followers?: number | null
          social_media_following?: number | null
          social_media_interests?: string[] | null
          social_media_profile_image_url?: string | null
          social_media_username?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "pipeline_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lead_id: string | null
          platform: string
          read: boolean | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          platform: string
          read?: boolean | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          platform?: string
          read?: boolean | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_embeddings: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_embeddings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          color: string | null
          content: string
          created_at: string | null
          id: string
          lead_id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          target_page: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          target_page?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          target_page?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_onboarding_phases: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_onboarding_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lead_id: string
          phase_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          phase_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          phase_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      phase_based_analyses: {
        Row: {
          analysis: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          phase_id: string
        }
        Insert: {
          analysis?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          phase_id: string
        }
        Update: {
          analysis?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          phase_id?: string
        }
        Relationships: []
      }
      pipeline_phases: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          order_index: number | null
          pipeline_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          order_index?: number | null
          pipeline_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          order_index?: number | null
          pipeline_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_phases_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_auth_status: {
        Row: {
          access_token: string | null
          auth_token: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_connected: boolean | null
          platform: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          auth_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          platform: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          auth_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          platform?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_modules: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          module_order: number | null
          order_index: number | null
          platform_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          module_order?: number | null
          order_index?: number | null
          platform_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          module_order?: number | null
          order_index?: number | null
          platform_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_modules_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          invite_code: string | null
          linked_modules: string[] | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          invite_code?: string | null
          linked_modules?: string[] | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          invite_code?: string | null
          linked_modules?: string[] | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      presentation_pages: {
        Row: {
          content: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_url_active: boolean | null
          lead_id: string | null
          slug: string | null
          title: string
          user_id: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_url_active?: boolean | null
          lead_id?: string | null
          slug?: string | null
          title: string
          user_id: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_url_active?: boolean | null
          lead_id?: string | null
          slug?: string | null
          title?: string
          user_id?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_pages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_views: {
        Row: {
          id: string
          ip_address: string | null
          page_id: string
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          page_id: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          page_id?: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_views_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "presentation_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_super_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          network_marketing_id: string | null
          openai_api_key: string | null
          registration_completed: boolean | null
          registration_step: number | null
          theme: string | null
          updated_at: string | null
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          network_marketing_id?: string | null
          openai_api_key?: string | null
          registration_completed?: boolean | null
          registration_step?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          network_marketing_id?: string | null
          openai_api_key?: string | null
          registration_completed?: boolean | null
          registration_step?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      shortcuts: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          shortcut_key: string | null
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          shortcut_key?: string | null
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          shortcut_key?: string | null
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string | null
          host: string
          id: string
          is_active: boolean | null
          password: string
          port: number | null
          updated_at: string | null
          use_tls: boolean | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name?: string | null
          host: string
          id?: string
          is_active?: boolean | null
          password: string
          port?: number | null
          updated_at?: string | null
          use_tls?: boolean | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          host?: string
          id?: string
          is_active?: boolean | null
          password?: string
          port?: number | null
          updated_at?: string | null
          use_tls?: boolean | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          lead_id: string
          media_type: string | null
          media_urls: string[] | null
          platform: string
          post_type: string
          posted_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          media_type?: string | null
          media_urls?: string[] | null
          platform: string
          post_type: string
          posted_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          media_type?: string | null
          media_urls?: string[] | null
          platform?: string
          post_type?: string
          posted_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_posts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_scan_history: {
        Row: {
          created_at: string | null
          id: string
          leads_found: number | null
          platform: string
          scan_status: string | null
          search_query: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leads_found?: number | null
          platform: string
          scan_status?: string | null
          search_query?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leads_found?: number | null
          platform?: string
          scan_status?: string | null
          search_query?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          cancelled: boolean | null
          color: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          meeting_type: string | null
          order_index: number | null
          priority: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancelled?: boolean | null
          color?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          meeting_type?: string | null
          order_index?: number | null
          priority?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancelled?: boolean | null
          color?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          meeting_type?: string | null
          order_index?: number | null
          priority?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          name: string
          order_index: number | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          order_index?: number | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          order_index?: number | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_categories_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_category_settings: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          size: string | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          size?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_category_settings_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "team_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      team_direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
          team_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
          team_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_direct_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_direct_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_events: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          id: string
          is_90_day_run: boolean | null
          is_admin_only: boolean | null
          recurring_day_of_week: number | null
          recurring_pattern: string | null
          start_time: string
          team_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          is_90_day_run?: boolean | null
          is_admin_only?: boolean | null
          recurring_day_of_week?: number | null
          recurring_pattern?: string | null
          start_time: string
          team_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          is_90_day_run?: boolean | null
          is_admin_only?: boolean | null
          recurring_day_of_week?: number | null
          recurring_pattern?: string | null
          start_time?: string
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_post_comments: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          post_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          post_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_post_comments_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_posts: {
        Row: {
          category_id: string
          content: string
          created_at: string | null
          created_by: string
          file_urls: string[] | null
          id: string
          pinned: boolean | null
          team_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string | null
          created_by: string
          file_urls?: string[] | null
          id?: string
          pinned?: boolean | null
          team_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string | null
          created_by?: string
          file_urls?: string[] | null
          id?: string
          pinned?: boolean | null
          team_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_posts_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "team_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_team_posts_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          join_code: string | null
          logo_url: string | null
          max_members: number | null
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          join_code?: string | null
          logo_url?: string | null
          max_members?: number | null
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          join_code?: string | null
          logo_url?: string | null
          max_members?: number | null
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      user_links: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      vision_board_images: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          position_x: number | null
          position_y: number | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          position_x?: number | null
          position_y?: number | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          position_x?: number | null
          position_y?: number | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_teams: {
        Args: { uid: string }
        Returns: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          join_code: string | null
          logo_url: string | null
          max_members: number | null
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
          video_url: string | null
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_team_member: {
        Args: { team_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_team_member_of_post: {
        Args: { post_uuid: string; user_uuid: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      mark_all_notifications_as_read: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
