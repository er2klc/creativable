import { PostType } from "../../types/lead";

export interface MediaDisplayProps {
  mediaUrls?: string[];
  videoUrl?: string;
  localMediaPaths?: string[];
  localVideoPath?: string;
  mediaType?: string;
  postType: PostType;
  kontaktIdFallback?: string;
}