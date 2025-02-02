import { Json } from './base/json';
import {
  ChatbotSetting,
  Keyword,
  LeadFile,
  Message,
  Note,
  Pipeline,
  PipelinePhase,
  Profile,
  Setting,
  SocialMediaPost,
  SocialMediaScanHistory,
  SupportTicket,
  Task,
  Team,
  TeamMember,
  TreeLink,
  TreeProfile,
  UserDocument,
  UserSignature,
  VisionBoard,
  VisionBoardImage
} from './entities';

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
