export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      changelog_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string
          id: string
          status: string
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          created_at: string | null
          id: string
          openai_api_key: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          openai_api_key?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          openai_api_key?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_embeddings: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          team_id: string | null
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          team_id?: string | null
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_embeddings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_shortcuts: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          target_id: string | null
          target_slug: string | null
          title: string
          type: Database["public"]["Enums"]["shortcut_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number
          target_id?: string | null
          target_slug?: string | null
          title?: string
          type: Database["public"]["Enums"]["shortcut_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          target_id?: string | null
          target_slug?: string | null
          title?: string
          type?: Database["public"]["Enums"]["shortcut_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
          tokens: number
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          tokens?: number
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          tokens?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "user_documents"
            referencedColumns: ["id"]
          },
        ]
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
          created_by: string | null
          description: string | null
          id: string
          module_id: string | null
          submodule_order: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          module_id?: string | null
          submodule_order?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          module_id?: string | null
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
          {
            foreignKeyName: "fk_module"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "elevate_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_module_id"
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
          created_by: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          lerninhalte_id: string | null
          preview_file_path: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          lerninhalte_id?: string | null
          preview_file_path?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          lerninhalte_id?: string | null
          preview_file_path?: string | null
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
          lerninhalte_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lerninhalte_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lerninhalte_id?: string | null
          updated_at?: string | null
          user_id?: string | null
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
            foreignKeyName: "elevate_modules_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "elevate_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elevate_modules_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "elevate_platforms_access"
            referencedColumns: ["platform_id"]
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
          linked_modules: string[] | null
          logo_url: string | null
          name: string
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
        }
        Relationships: []
      }
      elevate_team_access: {
        Row: {
          granted_at: string | null
          granted_by: string
          id: string
          platform_id: string
          team_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by: string
          id?: string
          platform_id: string
          team_id: string
        }
        Update: {
          granted_at?: string | null
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
            foreignKeyName: "elevate_team_access_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "elevate_platforms_access"
            referencedColumns: ["platform_id"]
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
          access_type: string
          granted_at: string | null
          granted_by: string
          id: string
          platform_id: string
          user_id: string
        }
        Insert: {
          access_type?: string
          granted_at?: string | null
          granted_by: string
          id?: string
          platform_id: string
          user_id: string
        }
        Update: {
          access_type?: string
          granted_at?: string | null
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
          {
            foreignKeyName: "elevate_user_access_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "elevate_platforms_access"
            referencedColumns: ["platform_id"]
          },
        ]
      }
      elevate_user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lerninhalte_id: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lerninhalte_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lerninhalte_id?: string | null
          user_id?: string | null
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
      keywords: {
        Row: {
          created_at: string | null
          id: string
          keyword: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyword: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          keyword?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          best_contact_times: string | null
          birth_date: string | null
          business_description: string | null
          challenges: string[] | null
          city: string | null
          company_name: string | null
          contact_type: string | null
          country: string | null
          created_at: string | null
          email: string | null
          emotional_analysis: Json | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          goals: string[] | null
          id: string
          industry: string
          interaction_prediction: Json | null
          interests: string[] | null
          languages: string[] | null
          last_action: string | null
          last_action_date: string | null
          last_name: string | null
          last_social_media_scan: string | null
          name: string
          next_steps: Json | null
          notes: string | null
          phase_id: string
          phone_number: string | null
          pipeline_id: string
          platform: string
          position: string | null
          postal_code: string | null
          preferred_communication_channel:
            | Database["public"]["Enums"]["communication_channel"]
            | null
          products_services: string | null
          referred_by: string | null
          region: string | null
          slug: string | null
          social_media_bio: string | null
          social_media_interests: string[] | null
          social_media_posts: Json | null
          social_media_username: string | null
          status: string | null
          street: string | null
          target_audience: string | null
          updated_at: string | null
          user_id: string
          usp: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          best_contact_times?: string | null
          birth_date?: string | null
          business_description?: string | null
          challenges?: string[] | null
          city?: string | null
          company_name?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          emotional_analysis?: Json | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          goals?: string[] | null
          id?: string
          industry: string
          interaction_prediction?: Json | null
          interests?: string[] | null
          languages?: string[] | null
          last_action?: string | null
          last_action_date?: string | null
          last_name?: string | null
          last_social_media_scan?: string | null
          name: string
          next_steps?: Json | null
          notes?: string | null
          phase_id: string
          phone_number?: string | null
          pipeline_id: string
          platform: string
          position?: string | null
          postal_code?: string | null
          preferred_communication_channel?:
            | Database["public"]["Enums"]["communication_channel"]
            | null
          products_services?: string | null
          referred_by?: string | null
          region?: string | null
          slug?: string | null
          social_media_bio?: string | null
          social_media_interests?: string[] | null
          social_media_posts?: Json | null
          social_media_username?: string | null
          status?: string | null
          street?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
          usp?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          best_contact_times?: string | null
          birth_date?: string | null
          business_description?: string | null
          challenges?: string[] | null
          city?: string | null
          company_name?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          emotional_analysis?: Json | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          goals?: string[] | null
          id?: string
          industry?: string
          interaction_prediction?: Json | null
          interests?: string[] | null
          languages?: string[] | null
          last_action?: string | null
          last_action_date?: string | null
          last_name?: string | null
          last_social_media_scan?: string | null
          name?: string
          next_steps?: Json | null
          notes?: string | null
          phase_id?: string
          phone_number?: string | null
          pipeline_id?: string
          platform?: string
          position?: string | null
          postal_code?: string | null
          preferred_communication_channel?:
            | Database["public"]["Enums"]["communication_channel"]
            | null
          products_services?: string | null
          referred_by?: string | null
          region?: string | null
          slug?: string | null
          social_media_bio?: string | null
          social_media_interests?: string[] | null
          social_media_posts?: Json | null
          social_media_username?: string | null
          status?: string | null
          street?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
          usp?: string | null
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
      message_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          id: string
          lead_id: string | null
          platform: string
          read: boolean
          sent_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          id?: string
          lead_id?: string | null
          platform: string
          read?: boolean
          sent_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          id?: string
          lead_id?: string | null
          platform?: string
          read?: boolean
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
      pipeline_phases: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number
          pipeline_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number
          pipeline_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number
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
          order_index: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number
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
          about_me: string | null
          business_description: string | null
          company_name: string | null
          created_at: string | null
          default_message_template: string | null
          facebook_auth_token: string | null
          facebook_connected: boolean | null
          id: string
          instagram_app_id: string | null
          instagram_app_secret: string | null
          instagram_auth_token: string | null
          instagram_connected: boolean | null
          language: string | null
          last_selected_pipeline_id: string | null
          linkedin_auth_token: string | null
          linkedin_connected: boolean | null
          openai_api_key: string | null
          products_services: string | null
          registration_company_name: string | null
          registration_completed: boolean | null
          registration_step: number | null
          superchat_api_key: string | null
          target_audience: string | null
          tiktok_auth_token: string | null
          tiktok_connected: boolean | null
          updated_at: string | null
          user_id: string
          usp: string | null
          whatsapp_number: string | null
          whatsapp_verified: boolean | null
        }
        Insert: {
          about_me?: string | null
          business_description?: string | null
          company_name?: string | null
          created_at?: string | null
          default_message_template?: string | null
          facebook_auth_token?: string | null
          facebook_connected?: boolean | null
          id?: string
          instagram_app_id?: string | null
          instagram_app_secret?: string | null
          instagram_auth_token?: string | null
          instagram_connected?: boolean | null
          language?: string | null
          last_selected_pipeline_id?: string | null
          linkedin_auth_token?: string | null
          linkedin_connected?: boolean | null
          openai_api_key?: string | null
          products_services?: string | null
          registration_company_name?: string | null
          registration_completed?: boolean | null
          registration_step?: number | null
          superchat_api_key?: string | null
          target_audience?: string | null
          tiktok_auth_token?: string | null
          tiktok_connected?: boolean | null
          updated_at?: string | null
          user_id: string
          usp?: string | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
        }
        Update: {
          about_me?: string | null
          business_description?: string | null
          company_name?: string | null
          created_at?: string | null
          default_message_template?: string | null
          facebook_auth_token?: string | null
          facebook_connected?: boolean | null
          id?: string
          instagram_app_id?: string | null
          instagram_app_secret?: string | null
          instagram_auth_token?: string | null
          instagram_connected?: boolean | null
          language?: string | null
          last_selected_pipeline_id?: string | null
          linkedin_auth_token?: string | null
          linkedin_connected?: boolean | null
          openai_api_key?: string | null
          products_services?: string | null
          registration_company_name?: string | null
          registration_completed?: boolean | null
          registration_step?: number | null
          superchat_api_key?: string | null
          target_audience?: string | null
          tiktok_auth_token?: string | null
          tiktok_connected?: boolean | null
          updated_at?: string | null
          user_id?: string
          usp?: string | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_last_selected_pipeline_id_fkey"
            columns: ["last_selected_pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_visitor: boolean | null
          message: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_visitor?: boolean | null
          message: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_visitor?: boolean | null
          message?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          cancelled: boolean | null
          color: string | null
          completed: boolean | null
          created_at: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          meeting_type: string | null
          order_index: number | null
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          cancelled?: boolean | null
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          meeting_type?: string | null
          order_index?: number | null
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          cancelled?: boolean | null
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          meeting_type?: string | null
          order_index?: number | null
          priority?: string | null
          title?: string
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
      team_90_day_runs: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          start_date: string
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          start_date: string
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          start_date?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_90_day_runs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_calendar_disabled_events: {
        Row: {
          created_at: string | null
          disabled_by: string
          disabled_date: string
          event_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          disabled_by: string
          disabled_date: string
          event_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          disabled_by?: string
          disabled_date?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_calendar_disabled_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "team_calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      team_calendar_events: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string
          is_90_day_run: boolean | null
          is_admin_only: boolean | null
          is_multi_day: boolean | null
          is_team_event: boolean | null
          recurring_day_of_week: number | null
          recurring_pattern:
            | Database["public"]["Enums"]["recurring_pattern"]
            | null
          start_time: string
          team_id: string | null
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_90_day_run?: boolean | null
          is_admin_only?: boolean | null
          is_multi_day?: boolean | null
          is_team_event?: boolean | null
          recurring_day_of_week?: number | null
          recurring_pattern?:
            | Database["public"]["Enums"]["recurring_pattern"]
            | null
          start_time: string
          team_id?: string | null
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_90_day_run?: boolean | null
          is_admin_only?: boolean | null
          is_multi_day?: boolean | null
          is_team_event?: boolean | null
          recurring_day_of_week?: number | null
          recurring_pattern?:
            | Database["public"]["Enums"]["recurring_pattern"]
            | null
          start_time?: string
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_calendar_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_categories: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          order_index: number
          slug: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          slug: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          slug?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_categories_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_content_embeddings: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          team_id: string
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          team_id: string
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_content_embeddings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_hidden_snaps: {
        Row: {
          created_at: string | null
          hidden_by: string
          id: string
          snap_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          hidden_by: string
          id?: string
          snap_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          hidden_by?: string
          id?: string
          snap_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_hidden_snaps_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_points: {
        Row: {
          created_at: string | null
          id: string
          level: number
          points: number
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number
          points?: number
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          points?: number
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_points_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
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
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_news: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          pinned: boolean | null
          team_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          pinned?: boolean | null
          team_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          pinned?: boolean | null
          team_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_news_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_point_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          points: number
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          points: number
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          points?: number
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_point_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_point_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "team_post_comments_post_id_fkey"
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
            foreignKeyName: "team_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "team_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_posts_team_id_fkey"
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
          video_url?: string | null
        }
        Relationships: []
      }
      tree_links: {
        Row: {
          created_at: string | null
          id: string
          order_index: number | null
          profile_id: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number | null
          profile_id: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number | null
          profile_id?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tree_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "tree_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tree_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          slug: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          slug: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          slug?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_bios: {
        Row: {
          created_at: string | null
          cta_goal: string | null
          generated_bio: string | null
          id: string
          language: string | null
          mission: string | null
          preferred_emojis: string | null
          role: string | null
          social_proof: string | null
          target_audience: string | null
          unique_strengths: string | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cta_goal?: string | null
          generated_bio?: string | null
          id?: string
          language?: string | null
          mission?: string | null
          preferred_emojis?: string | null
          role?: string | null
          social_proof?: string | null
          target_audience?: string | null
          unique_strengths?: string | null
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cta_goal?: string | null
          generated_bio?: string | null
          id?: string
          language?: string | null
          mission?: string | null
          preferred_emojis?: string | null
          role?: string | null
          social_proof?: string | null
          target_audience?: string | null
          unique_strengths?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string | null
          file_path: string | null
          id: string
          metadata: Json | null
          source_type: string
          source_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          source_type: string
          source_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          source_type?: string
          source_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_signatures: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          font: string | null
          font_size: string | null
          id: string
          instagram: string | null
          link_color: string | null
          linkedin: string | null
          logo_url: string | null
          name: string
          phone: string | null
          position: string | null
          template: string
          text_color: string | null
          theme_color: string | null
          tiktok: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          whatsapp: string | null
          xing: string | null
          youtube: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          font?: string | null
          font_size?: string | null
          id?: string
          instagram?: string | null
          link_color?: string | null
          linkedin?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          position?: string | null
          template: string
          text_color?: string | null
          theme_color?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          whatsapp?: string | null
          xing?: string | null
          youtube?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          font?: string | null
          font_size?: string | null
          id?: string
          instagram?: string | null
          link_color?: string | null
          linkedin?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          template?: string
          text_color?: string | null
          theme_color?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          whatsapp?: string | null
          xing?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      vision_board_images: {
        Row: {
          board_id: string
          created_at: string | null
          id: string
          image_url: string
          order_index: number
          theme: string
        }
        Insert: {
          board_id: string
          created_at?: string | null
          id?: string
          image_url: string
          order_index?: number
          theme: string
        }
        Update: {
          board_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
          order_index?: number
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "vision_board_images_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "vision_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_boards: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      elevate_platforms_access: {
        Row: {
          platform_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_team_points: {
        Args: {
          p_team_id: string
          p_user_id: string
          p_event_type: string
          p_points: number
          p_metadata?: Json
        }
        Returns: undefined
      }
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      generate_elevate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_join_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_slug: {
        Args: {
          base_slug: string
          table_name: string
          existing_id?: string
        }
        Returns: string
      }
      get_user_teams: {
        Args: {
          uid: string
        }
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
          video_url: string | null
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_chunks: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          user_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
          document_id: string
          document_title: string
          source_type: string
        }[]
      }
      match_content: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          search_content_type: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
          metadata: Json
          team_id: string
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      communication_channel:
        | "phone"
        | "email"
        | "sms"
        | "whatsapp"
        | "social_media"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      recurring_pattern: "none" | "daily" | "weekly" | "monthly" | "yearly"
      shortcut_type:
        | "team"
        | "team_calendar"
        | "personal_calendar"
        | "create_contact"
        | "learning_platform"
        | "todo_list"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
