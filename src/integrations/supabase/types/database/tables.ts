import { Json } from './entities/base/json';
import {
  PostType,
  RecurringPattern,
  ShortcutType,
  CommunicationChannel,
  GenderType
} from './entities/base/enums';

import {
  Profile,
  Setting,
  SocialMediaPost,
  SocialMediaScanHistory,
  Lead,
  Team,
  Pipeline,
  PipelinePhase,
  LeadFile,
  TreeProfile,
  TreeLink,
  VisionBoard,
  VisionBoardImage,
  SupportTicket,
  TeamMember,
  ChatbotSetting,
  Keyword
} from './entities';

export interface Database {
  public: {
    Tables: {
      leads: Lead;
      teams: Team;
      profiles: Profile;
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
      vision_boards: VisionBoard;
      vision_board_images: VisionBoardImage;
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