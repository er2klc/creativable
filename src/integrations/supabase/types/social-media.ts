import { Json } from './json';
import { PostType } from './enums';

export interface SocialMediaPost {
  id: string;
  user_id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string | null;
  caption: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  media_urls: string[];
  media_type: string | null;
  video_url: string | null;
  hashtags: string[] | null;
  tagged_users: any[] | null;
  timestamp: string | null;
}

export type SocialMediaPostRaw = SocialMediaPost;