
export interface Session {
  timestamp: string;
  progress: number;
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
  progress_milestones?: Array<{
    progress: number;
    timestamp: string;
    completed: boolean;
  }>;
  view_history?: Array<{
    timestamp: string;
    progress: number;
    event_type: string;
  }>;
}

export interface YoutubeCardProps {
  content: string;
  metadata: YoutubeCardMetadata;
  timestamp?: string;
}
