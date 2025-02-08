
import { CheckCircle2, X } from "lucide-react";

interface VideoThumbnailProps {
  videoId: string;
  latestProgress: number;
}

export const VideoThumbnail = ({ videoId, latestProgress }: VideoThumbnailProps) => {
  console.log("DEBUG VideoThumbnail:", { videoId, latestProgress });

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
      {latestProgress === 0 && (
        <div className="absolute top-2 right-2">
          <X className="h-6 w-6 text-red-500" />
        </div>
      )}
      {latestProgress > 0 && latestProgress < 95 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${latestProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};
