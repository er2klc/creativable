import { Json } from '../base/json';

export interface SocialMediaScanHistory {
  id: string;
  lead_id: string | null;
  platform: string;
  scanned_at: string | null;
  followers_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  engagement_rate: number | null;
  success: boolean | null;
  error_message: string | null;
  profile_data: Json | null;
  experience: Json | null;
  education: Json | null;
  skills: Json | null;
  certifications: Json | null;
  languages: Json | null;
  recommendations: Json | null;
}