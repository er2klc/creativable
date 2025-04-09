
export interface YoutubeCardProps {
  content: string;
  metadata?: {
    type?: string;
    view_id?: string;
    url?: string;
    title?: string;
    video_progress?: number;
    completed?: boolean;
    presentationUrl?: string;
    event_type?: string;
    id?: string;
    ip?: string;
    location?: string;
    view_history?: any[];
    [key: string]: any;
  };
  timestamp?: string;
}
