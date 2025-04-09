
import { CheckCircle2 } from "lucide-react";

interface VideoThumbnailProps {
  videoId: string;
  latestProgress: number;
}

export const VideoThumbnail = ({ videoId, latestProgress }: VideoThumbnailProps) => {
  return (
    <div className="w-48 h-27 rounded-lg overflow-hidden relative group p-2 bg-gray-50">
      <img 
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
        alt="Video thumbnail"
        className="w-full h-full object-cover rounded"
      />
      {latestProgress >= 95 && (
        <div className="absolute top-2 right-2 bg-white rounded-full">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-200">
        <div 
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${latestProgress}%` }}
        />
      </div>
    </div>
  );
};
