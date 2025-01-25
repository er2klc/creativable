export interface SocialMediaPost {
  id: string;
  platform: string;
  post_type: string;
  content: string | null;
  caption: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  posted_at: string | null;
  local_media_paths: string[] | null;
  video_url: string | null;
  hashtags: string[] | null;
}