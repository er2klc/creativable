
export interface Session {
  timestamp: string;
  progress: number;
  start_time?: string;
  end_time?: string;
  max_progress?: number;
  event_type?: string;
}

export interface YoutubeCardProps {
  content: string;
  metadata: YoutubeCardMetadata;
  timestamp?: string;
}

export interface YoutubeCardMetadata {
  type: string;
  video_progress?: number;
  ip?: string;
  location?: string;
  event_type?: string;
  presentationUrl?: string;
  title?: string;
  url?: string;
  id?: string;
  view_id?: string;
  completed?: boolean;
  view_history?: Array<{
    timestamp: string;
    progress: number;
    event_type: string;
  }>;
}
