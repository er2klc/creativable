export interface InstagramProfile {
  fullName?: string;
  username: string;
  biography?: string;
  followersCount: string | number;
  followsCount: string | number;
  profilePicUrl?: string;
  profilePicUrlHD?: string;
  latestPosts?: InstagramPost[];
  verified?: boolean;
  businessCategoryName?: string;
}

export interface InstagramPost {
  id: string;
  type: string;
  caption?: string;
  url?: string;
  timestamp?: string;
  likesCount?: string | number;
  commentsCount?: string | number;
  videoUrl?: string;
  displayUrl?: string;
  images?: string[];
  hashtags?: string[];
  mentions?: string[];
  taggedUsers?: { username: string }[];
  locationName?: string;
  musicInfo?: any;
  alt?: string;
  lead_id?: string;
  media_urls?: string[];
  media_type?: string;
}

export interface ProcessingState {
  totalFiles: number;
  processedFiles: number;
  currentFile?: string;
  error?: string;
}