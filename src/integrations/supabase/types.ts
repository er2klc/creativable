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
      contact_field_settings: {
        Row: {
          created_at: string | null
          field_group: string
          field_name: string
          field_type: string
          icon: string | null
          id: string
          order_index: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          field_group: string
          field_name: string
          field_type: string
          icon?: string | null
          id?: string
          order_index?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          field_group?: string
          field_name?: string
          field_type?: string
          icon?: string | null
          id?: string
          order_index?: number
          user_id?: string
        }
        Relationships: []
      }
      contact_group_states: {
        Row: {
          created_at: string | null
          group_name: string
          id: string
          is_collapsed: boolean
          lead_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_name: string
          id?: string
          is_collapsed?: boolean
          lead_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_name?: string
          id?: string
          is_collapsed?: boolean
          lead_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_group_states_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      content_embeddings: {
        Row: {
          chunk_index: number | null
          content: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          last_processed_at: string | null
          metadata: Json | null
          processed_at: string | null
          processing_error: string | null
          processing_status: string | null
          relevance_score: number | null
          source_id: string | null
          source_type: string | null
          team_id: string | null
          total_chunks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chunk_index?: number | null
          content: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          last_processed_at?: string | null
          metadata?: Json | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          relevance_score?: number | null
          source_id?: string | null
          source_type?: string | null
          team_id?: string | null
          total_chunks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chunk_index?: number | null
          content?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          last_processed_at?: string | null
          metadata?: Json | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          relevance_score?: number | null
          source_id?: string | null
          source_type?: string | null
          team_id?: string | null
          total_chunks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_embeddings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_content_embeddings_settings"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "settings"
            referencedColumns: ["user_id"]
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
      embedding_processing_status: {
        Row: {
          content_type: string
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
      lead_files: {
        Row: {
          compressed_file_path: string | null
          compressed_file_size: number | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          preview_path: string | null
          user_id: string | null
        }
        Insert: {
          compressed_file_path?: string | null
          compressed_file_size?: number | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          preview_path?: string | null
          user_id?: string | null
        }
        Update: {
          compressed_file_path?: string | null
          compressed_file_size?: number | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          preview_path?: string | null
          user_id?: string | null
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
      lead_phase_analyses: {
        Row: {
          action_items: Json | null
          analysis_type: string
          completed: boolean | null
          completed_at: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          metadata: Json | null
          phase_id: string
          recommendations: Json | null
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          analysis_type: string
          completed?: boolean | null
          completed_at?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          phase_id: string
          recommendations?: Json | null
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          analysis_type?: string
          completed?: boolean | null
          completed_at?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          phase_id?: string
          recommendations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_phase_analyses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_phase_analyses_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "pipeline_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          lead_id: string | null
          product_name: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          product_name: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          product_name?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_subscriptions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_summaries: {
        Row: {
          analysis_date: string | null
          business_profile: string | null
          commonalities: string | null
          communication_history: string | null
          contact_status: string | null
          created_at: string | null
          id: string
          lead_id: string
          metadata: Json | null
          recommendations: string | null
          relevant_topics: string | null
          strategy: string
          summary: string
          updated_at: string | null
        }
        Insert: {
          analysis_date?: string | null
          business_profile?: string | null
          commonalities?: string | null
          communication_history?: string | null
          contact_status?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          recommendations?: string | null
          relevant_topics?: string | null
          strategy: string
          summary: string
          updated_at?: string | null
        }
        Update: {
          analysis_date?: string | null
          business_profile?: string | null
          commonalities?: string | null
          communication_history?: string | null
          contact_status?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          recommendations?: string | null
          relevant_topics?: string | null
          strategy?: string
          summary?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_summaries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          apify_instagram_data: Json | null
          archive_reason: string | null
          birth_date: string | null
          city: string | null
          company_name: string | null
          contact_type: string | null
          created_at: string | null
          current_company_name: string | null
          education_summary: string | null
          email: string | null
          experience: Json | null
          follow_up_date: string | null
          id: string
          industry: string
          is_favorite: boolean | null
          languages: string[] | null
          last_action: string | null
          last_action_date: string | null
          last_interaction_date: string | null
          last_social_media_scan: string | null
          level: number | null
          linkedin_id: string | null
          name: string
          network_marketing_id: string | null
          next_steps: Json | null
          onboarding_progress: Json | null
          parent_id: string | null
          phase_id: string
          phone_number: string | null
          pipeline_id: string
          platform: string
          position: string | null
          region: string | null
          slug: string | null
          social_media_bio: string | null
          social_media_categories: string[] | null
          social_media_engagement_rate: number | null
          social_media_followers: number | null
          social_media_following: number | null
          social_media_interests: string[] | null
          social_media_last_post_date: string | null
          social_media_mentioned_users: Json | null
          social_media_posts_count: number | null
          social_media_profile_image_url: string | null
          social_media_stats: Json | null
          social_media_tagged_users: Json | null
          social_media_username: string | null
          social_media_verified: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
          usp: string | null
          website: string | null
        }
        Insert: {
          apify_instagram_data?: Json | null
          archive_reason?: string | null
          birth_date?: string | null
          city?: string | null
          company_name?: string | null
          contact_type?: string | null
          created_at?: string | null
          current_company_name?: string | null
          education_summary?: string | null
          email?: string | null
          experience?: Json | null
          follow_up_date?: string | null
          id?: string
          industry: string
          is_favorite?: boolean | null
          languages?: string[] | null
          last_action?: string | null
          last_action_date?: string | null
          last_interaction_date?: string | null
          last_social_media_scan?: string | null
          level?: number | null
          linkedin_id?: string | null
          name: string
          network_marketing_id?: string | null
          next_steps?: Json | null
          onboarding_progress?: Json | null
          parent_id?: string | null
          phase_id: string
          phone_number?: string | null
          pipeline_id: string
          platform: string
          position?: string | null
          region?: string | null
          slug?: string | null
          social_media_bio?: string | null
          social_media_categories?: string[] | null
          social_media_engagement_rate?: number | null
          social_media_followers?: number | null
          social_media_following?: number | null
          social_media_interests?: string[] | null
          social_media_last_post_date?: string | null
          social_media_mentioned_users?: Json | null
          social_media_posts_count?: number | null
          social_media_profile_image_url?: string | null
          social_media_stats?: Json | null
          social_media_tagged_users?: Json | null
          social_media_username?: string | null
          social_media_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          usp?: string | null
          website?: string | null
        }
        Update: {
          apify_instagram_data?: Json | null
          archive_reason?: string | null
          birth_date?: string | null
          city?: string | null
          company_name?: string | null
          contact_type?: string | null
          created_at?: string | null
          current_company_name?: string | null
          education_summary?: string | null
          email?: string | null
          experience?: Json | null
          follow_up_date?: string | null
          id?: string
          industry?: string
          is_favorite?: boolean | null
          languages?: string[] | null
          last_action?: string | null
          last_action_date?: string | null
          last_interaction_date?: string | null
          last_social_media_scan?: string | null
          level?: number | null
          linkedin_id?: string | null
          name?: string
          network_marketing_id?: string | null
          next_steps?: Json | null
          onboarding_progress?: Json | null
          parent_id?: string | null
          phase_id?: string
          phone_number?: string | null
          pipeline_id?: string
          platform?: string
          position?: string | null
          region?: string | null
          slug?: string | null
          social_media_bio?: string | null
          social_media_categories?: string[] | null
          social_media_engagement_rate?: number | null
          social_media_followers?: number | null
          social_media_following?: number | null
          social_media_interests?: string[] | null
          social_media_last_post_date?: string | null
          social_media_mentioned_users?: Json | null
          social_media_posts_count?: number | null
          social_media_profile_image_url?: string | null
          social_media_stats?: Json | null
          social_media_tagged_users?: Json | null
          social_media_username?: string | null
          social_media_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          usp?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
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
      linkedin_posts: {
        Row: {
          comments_count: number | null
          company: string | null
          content: string | null
          created_at: string | null
          degree: string | null
          end_date: string | null
          id: string
          lead_id: string | null
          likes_count: number | null
          local_media_paths: string[] | null
          location: string | null
          media_type: string | null
          media_urls: string[] | null
          metadata: Json | null
          position: string | null
          post_type: string | null
          posted_at: string | null
          reactions: Json | null
          school: string | null
          school_linkedin_url: string | null
          shares_count: number | null
          start_date: string | null
          url: string | null
        }
        Insert: {
          comments_count?: number | null
          company?: string | null
          content?: string | null
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          id: string
          lead_id?: string | null
          likes_count?: number | null
          local_media_paths?: string[] | null
          location?: string | null
          media_type?: string | null
          media_urls?: string[] | null
          metadata?: Json | null
          position?: string | null
          post_type?: string | null
          posted_at?: string | null
          reactions?: Json | null
          school?: string | null
          school_linkedin_url?: string | null
          shares_count?: number | null
          start_date?: string | null
          url?: string | null
        }
        Update: {
          comments_count?: number | null
          company?: string | null
          content?: string | null
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          likes_count?: number | null
          local_media_paths?: string[] | null
          location?: string | null
          media_type?: string | null
          media_urls?: string[] | null
          metadata?: Json | null
          position?: string | null
          post_type?: string | null
          posted_at?: string | null
          reactions?: Json | null
          school?: string | null
          school_linkedin_url?: string | null
          shares_count?: number | null
          start_date?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_posts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
          created_at: string | null
          id: string
          lead_id: string | null
          platform: string
          read: boolean
          sent_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          platform: string
          read?: boolean
          sent_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
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
      nexus_context: {
        Row: {
          content: string
          context_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          processing_status: string | null
          relevance_score: number | null
          source_id: string | null
          source_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          context_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          processing_status?: string | null
          relevance_score?: number | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          context_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          processing_status?: string | null
          relevance_score?: number | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nexus_embeddings: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          analysis_context: Json | null
          color: string | null
          content: string
          created_at: string | null
          icon_color: string | null
          icon_type: string | null
          id: string
          lead_id: string
          metadata: Json | null
          phase_analysis_id: string | null
          phase_change_details: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_context?: Json | null
          color?: string | null
          content: string
          created_at?: string | null
          icon_color?: string | null
          icon_type?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          phase_analysis_id?: string | null
          phase_change_details?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_context?: Json | null
          color?: string | null
          content?: string
          created_at?: string | null
          icon_color?: string | null
          icon_type?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          phase_analysis_id?: string | null
          phase_change_details?: Json | null
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
          {
            foreignKeyName: "notes_phase_analysis_id_fkey"
            columns: ["phase_analysis_id"]
            isOneToOne: false
            referencedRelation: "phase_based_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          read: boolean | null
          target_page: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean | null
          target_page?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean | null
          target_page?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_onboarding_phases: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number
          requirements: Json | null
          resources: Json | null
          tools: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index: number
          requirements?: Json | null
          resources?: Json | null
          tools?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          requirements?: Json | null
          resources?: Json | null
          tools?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_onboarding_pipeline: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_onboarding_progress: {
        Row: {
          completed_at: string | null
          completion_data: Json | null
          created_at: string | null
          id: string
          lead_id: string
          phase_id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_data?: Json | null
          created_at?: string | null
          id?: string
          lead_id: string
          phase_id: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_data?: Json | null
          created_at?: string | null
          id?: string
          lead_id?: string
          phase_id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_onboarding_progress_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_onboarding_progress_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "partner_onboarding_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_based_analyses: {
        Row: {
          action_items: Json | null
          analysis_type: string
          completed: boolean | null
          completed_at: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          metadata: Json | null
          phase_id: string
          recommendations: Json | null
        }
        Insert: {
          action_items?: Json | null
          analysis_type: string
          completed?: boolean | null
          completed_at?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          phase_id: string
          recommendations?: Json | null
        }
        Update: {
          action_items?: Json | null
          analysis_type?: string
          completed?: boolean | null
          completed_at?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          phase_id?: string
          recommendations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "phase_based_analyses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phase_based_analyses_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "pipeline_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_rules: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          phase_id: string
          rules: Json
          updated_at: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          phase_id: string
          rules?: Json
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          phase_id?: string
          rules?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phase_rules_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "pipeline_phases"
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
      presentation_pages: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_url_active: boolean | null
          lead_id: string
          slug: string
          title: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_url_active?: boolean | null
          lead_id: string
          slug: string
          title: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_url_active?: boolean | null
          lead_id?: string
          slug?: string
          title?: string
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_presentation_pages_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentation_pages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_view_sessions: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          max_progress: number | null
          start_time: string
          timezone: string | null
          view_id: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          max_progress?: number | null
          start_time: string
          timezone?: string | null
          view_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          max_progress?: number | null
          start_time?: string
          timezone?: string | null
          view_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presentation_view_sessions_view_id_fkey"
            columns: ["view_id"]
            isOneToOne: false
            referencedRelation: "presentation_views"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_views: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          ip_address: string | null
          last_progress_update: string | null
          lead_id: string
          location: string | null
          location_metadata: Json | null
          metadata: Json | null
          page_id: string
          updated_at: string | null
          video_progress: number | null
          view_history: Json | null
          viewed_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          last_progress_update?: string | null
          lead_id: string
          location?: string | null
          location_metadata?: Json | null
          metadata?: Json | null
          page_id: string
          updated_at?: string | null
          video_progress?: number | null
          view_history?: Json | null
          viewed_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          last_progress_update?: string | null
          lead_id?: string
          location?: string | null
          location_metadata?: Json | null
          metadata?: Json | null
          page_id?: string
          updated_at?: string | null
          video_progress?: number | null
          view_history?: Json | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_views_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
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
      secrets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          about_me: string | null
          apify_api_key: string | null
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
          linkedin_auth_token: string | null
          linkedin_connected: boolean | null
          network_marketing_id: string | null
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
          apify_api_key?: string | null
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
          linkedin_auth_token?: string | null
          linkedin_connected?: boolean | null
          network_marketing_id?: string | null
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
          apify_api_key?: string | null
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
          linkedin_auth_token?: string | null
          linkedin_connected?: boolean | null
          network_marketing_id?: string | null
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
        Relationships: []
      }
      social_media_posts: {
        Row: {
          bucket_path: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          current_file: string | null
          engagement_count: number | null
          error_message: string | null
          first_comment: string | null
          hashtags: string[] | null
          id: string
          lead_id: string | null
          likes_count: number | null
          local_media_paths: string[] | null
          local_media_urls: string[] | null
          local_video_path: string | null
          location: string | null
          media_count: number | null
          media_processing_status: string | null
          media_type: string | null
          media_urls: string[] | null
          mentioned_profiles: string[] | null
          metadata: Json | null
          platform: string
          post_type: Database["public"]["Enums"]["post_type"]
          posted_at: string | null
          processing_progress: number | null
          storage_status: string | null
          tagged_profiles: string[] | null
          tagged_users: Json | null
          url: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          bucket_path?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          current_file?: string | null
          engagement_count?: number | null
          error_message?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          lead_id?: string | null
          likes_count?: number | null
          local_media_paths?: string[] | null
          local_media_urls?: string[] | null
          local_video_path?: string | null
          location?: string | null
          media_count?: number | null
          media_processing_status?: string | null
          media_type?: string | null
          media_urls?: string[] | null
          mentioned_profiles?: string[] | null
          metadata?: Json | null
          platform: string
          post_type: Database["public"]["Enums"]["post_type"]
          posted_at?: string | null
          processing_progress?: number | null
          storage_status?: string | null
          tagged_profiles?: string[] | null
          tagged_users?: Json | null
          url?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          bucket_path?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          current_file?: string | null
          engagement_count?: number | null
          error_message?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          lead_id?: string | null
          likes_count?: number | null
          local_media_paths?: string[] | null
          local_media_urls?: string[] | null
          local_video_path?: string | null
          location?: string | null
          media_count?: number | null
          media_processing_status?: string | null
          media_type?: string | null
          media_urls?: string[] | null
          mentioned_profiles?: string[] | null
          metadata?: Json | null
          platform?: string
          post_type?: Database["public"]["Enums"]["post_type"]
          posted_at?: string | null
          processing_progress?: number | null
          storage_status?: string | null
          tagged_profiles?: string[] | null
          tagged_users?: Json | null
          url?: string | null
          user_id?: string
          video_url?: string | null
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
          certifications: Json | null
          current_file: string | null
          education: Json | null
          engagement_rate: number | null
          error_message: string | null
          experience: Json | null
          followers_count: number | null
          following_count: number | null
          id: string
          languages: Json | null
          lead_id: string | null
          platform: string
          posts_count: number | null
          processing_progress: number | null
          profile_data: Json | null
          recommendations: Json | null
          scanned_at: string | null
          skills: Json | null
          success: boolean | null
        }
        Insert: {
          certifications?: Json | null
          current_file?: string | null
          education?: Json | null
          engagement_rate?: number | null
          error_message?: string | null
          experience?: Json | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          languages?: Json | null
          lead_id?: string | null
          platform: string
          posts_count?: number | null
          processing_progress?: number | null
          profile_data?: Json | null
          recommendations?: Json | null
          scanned_at?: string | null
          skills?: Json | null
          success?: boolean | null
        }
        Update: {
          certifications?: Json | null
          current_file?: string | null
          education?: Json | null
          engagement_rate?: number | null
          error_message?: string | null
          experience?: Json | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          languages?: Json | null
          lead_id?: string | null
          platform?: string
          posts_count?: number | null
          processing_progress?: number | null
          profile_data?: Json | null
          recommendations?: Json | null
          scanned_at?: string | null
          skills?: Json | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_scan_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
          type: string | null
          updated_at: string | null
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
          type?: string | null
          updated_at?: string | null
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
          type?: string | null
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
          color: string | null
          created_at: string | null
          created_by: string
          description: string | null
          icon: string | null
          id: string
          is_private: boolean | null
          is_public: boolean | null
          name: string
          order_index: number
          slug: string
          team_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
          name: string
          order_index?: number
          slug: string
          team_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
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
      team_category_post_counts: {
        Row: {
          category_id: string
          id: string
          post_count: number
          team_id: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          id?: string
          post_count?: number
          team_id: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          id?: string
          post_count?: number
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_category_post_counts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "team_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_category_post_counts_team_id_fkey"
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
          size: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          size?: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          size?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_category_settings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "team_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_category_settings_team_id_fkey"
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
      team_member_badges: {
        Row: {
          awarded_at: string | null
          awarded_by: string
          badge_level: number | null
          badge_type: string
          id: string
          metadata: Json | null
          points_bonus: number | null
          team_id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          awarded_by: string
          badge_level?: number | null
          badge_type: string
          id?: string
          metadata?: Json | null
          points_bonus?: number | null
          team_id: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          awarded_by?: string
          badge_level?: number | null
          badge_type?: string
          id?: string
          metadata?: Json | null
          points_bonus?: number | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_badges_team_id_fkey"
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
            foreignKeyName: "fk_team_post_comments_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_post_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_post_mentions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          created_by: string
          id: string
          mentioned_user_id: string
          post_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          mentioned_user_id: string
          post_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          mentioned_user_id?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_post_mentions_mentioned_user_id"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_post_mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "team_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_post_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_post_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_post_reactions: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          post_id: string
          reaction_type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          post_id: string
          reaction_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          post_id?: string
          reaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_post_reactions_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_team_post_reactions_posts"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_post_reactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_posts: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          created_by: string
          edited: boolean | null
          file_urls: string[] | null
          hashtags: string[] | null
          id: string
          last_autosave_at: string | null
          last_edited_at: string | null
          mentioned_users: string[] | null
          pinned: boolean | null
          slug: string
          team_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          created_by: string
          edited?: boolean | null
          file_urls?: string[] | null
          hashtags?: string[] | null
          id?: string
          last_autosave_at?: string | null
          last_edited_at?: string | null
          mentioned_users?: string[] | null
          pinned?: boolean | null
          slug: string
          team_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          edited?: boolean | null
          file_urls?: string[] | null
          hashtags?: string[] | null
          id?: string
          last_autosave_at?: string | null
          last_edited_at?: string | null
          mentioned_users?: string[] | null
          pinned?: boolean | null
          slug?: string
          team_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_posts_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "team_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      user_links: {
        Row: {
          created_at: string | null
          custom_group_name: string | null
          group_type: Database["public"]["Enums"]["link_group_type"] | null
          id: string
          is_favorite: boolean | null
          metadata: Json | null
          order_index: number | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_group_name?: string | null
          group_type?: Database["public"]["Enums"]["link_group_type"] | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_group_name?: string | null
          group_type?: Database["public"]["Enums"]["link_group_type"] | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
          url?: string
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
      active_notifications: {
        Row: {
          content: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          metadata: Json | null
          read: boolean | null
          target_page: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          metadata?: Json | null
          read?: boolean | null
          target_page?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          metadata?: Json | null
          read?: boolean | null
          target_page?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      elevate_platforms_access: {
        Row: {
          platform_id: string | null
        }
        Relationships: []
      }
      team_post_comments_count: {
        Row: {
          count: number | null
          post_id: string | null
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
    }
    Functions: {
      array_append: {
        Args: {
          arr: Json
          elem: Json
        }
        Returns: Json
      }
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
      check_platform_access: {
        Args: {
          platform_id: string
          user_id: string
        }
        Returns: boolean
      }
      check_team_member: {
        Args: {
          team_id: string
          user_id: string
        }
        Returns: boolean
      }
      create_phase_analysis: {
        Args: {
          p_lead_id: string
          p_phase_id: string
          p_user_id: string
          p_analysis_type: string
          p_content: string
          p_metadata: Json
        }
        Returns: {
          action_items: Json | null
          analysis_type: string
          completed: boolean | null
          completed_at: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          metadata: Json | null
          phase_id: string
          recommendations: Json | null
          updated_at: string | null
        }
      }
      create_youtube_metadata: {
        Args: {
          title: string
          url: string
          view_id: string
          event_type?: string
          ip?: string
          location?: string
          video_progress?: number
          completed?: boolean
          view_history?: Json
          presentation_url?: string
        }
        Returns: Json
      }
      generate_elevate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_join_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_presentation_slug: {
        Args: {
          title: string
          video_id: string
        }
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
      get_contact_context: {
        Args: {
          p_user_id: string
          p_contact_id: string
        }
        Returns: {
          id: string
          name: string
          platform: string
          industry: string
          social_media_username: string
          social_media_bio: string
          social_media_followers: number
          social_media_following: number
          social_media_engagement_rate: number
          last_interaction_date: string
          recent_posts: Json
          recent_notes: string[]
          recent_messages: string[]
        }[]
      }
      get_contact_social_insights: {
        Args: {
          contact_id: string
        }
        Returns: {
          recent_posts: Json
          engagement_stats: Json
          content_insights: Json
          phase_info: Json
        }[]
      }
      get_contextual_contacts: {
        Args: {
          p_user_id: string
          p_context: string
          p_phase_id?: string
          p_keyword?: string
          p_limit?: number
        }
        Returns: {
          id: string
          name: string
          platform: string
          social_media_username: string
          social_media_profile_image_url: string
          social_media_followers: number
          social_media_following: number
          phase_id: string
          phase_name: string
          last_interaction_date: string
          last_post_content: string
          last_post_date: string
          sort_order: number
        }[]
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
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
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
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_team_admin: {
        Args: {
          team_id: string
        }
        Returns: boolean
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
      jsonb_array_append: {
        Args: {
          arr: Json
          elem: Json
        }
        Returns: Json
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
      mark_all_notifications_as_read: {
        Args: {
          user_id_input: string
        }
        Returns: undefined
      }
      match_combined_content: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          p_user_id: string
          p_team_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
          metadata: Json
          source: string
          team_id: string
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
      match_lead_content: {
        Args: {
          p_user_id: string
          query_text: string
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          platform: string
          industry: string
          status: string
          last_interaction_date: string
          contact_type: string
          social_media_username: string
          email: string
          phone_number: string
          notes: string[]
        }[]
      }
      match_team_content: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          p_team_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
          metadata: Json
          created_at: string
          team_id: string
          content_type: string
        }[]
      }
      match_user_embeddings: {
        Args: {
          p_user_id: string
          query_embedding: string
          similarity_threshold: number
          match_count: number
          p_content_type?: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
          metadata: Json
          content_type: string
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
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
      context_type:
        | "user_profile"
        | "business_info"
        | "contact_info"
        | "team_content"
        | "learning_content"
        | "calendar_events"
        | "tasks"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      link_group_type: "zoom" | "youtube" | "documents" | "custom" | "other"
      post_type:
        | "post"
        | "video"
        | "reel"
        | "story"
        | "igtv"
        | "Image"
        | "Sidecar"
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
