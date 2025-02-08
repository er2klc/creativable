
import { CheckCircle2 } from "lucide-react";

interface VideoThumbnailProps {
  videoId: string;
  latestProgress: number;
}

export const VideoThumbnail = ({ videoId, latestProgress }: VideoThumbnailProps) => {
  return (
    <div className="w-48 h-27 rounded overflow-hidden relative">
      <img 
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />
      {latestProgress >= 95 && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
      )}
    </div>
  );
};

