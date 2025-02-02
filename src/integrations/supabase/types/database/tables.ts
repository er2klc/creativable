import { Json } from './base/json';
import {
  Profile,
  Setting,
  SocialMediaPost,
  SocialMediaScanHistory,
  Team,
  Lead
} from './entities';

export interface Database {
  public: {
    Tables: {
      leads: Lead;
      teams: Team;
      profiles: Profile;
      settings: Setting;
      social_media_posts: SocialMediaPost;
      social_media_scan_history: SocialMediaScanHistory;
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
  };
}