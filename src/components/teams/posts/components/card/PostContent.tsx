
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { MediaGallery } from "../media-gallery/MediaGallery";

interface PostContentProps {
  title: string;
  content?: string;
  contentLength: number;
  lineClamp: string;
  videoId?: string | null;
  fileUrls?: string[];
  imageHeight: string;
  onVideoClick?: (e: React.MouseEvent) => void;
  hasMedia: boolean;
}

export const PostContent = ({ 
  title, 
  content, 
  contentLength,
  lineClamp,
  videoId,
  fileUrls,
  imageHeight,
  onVideoClick,
  hasMedia
}: PostContentProps) => {
  return (
    <div className="flex gap-4 cursor-pointer">
      <div className={cn(
        "flex-1 space-y-2",
        (hasMedia || videoId) && "max-w-[70%]"
      )}>
        <h3 className="text-lg font-semibold">
          {title}
        </h3>
        
        {content && (
          <div 
            className={cn(
              "text-muted-foreground text-sm",
              lineClamp
            )}
            dangerouslySetInnerHTML={{ 
              __html: content.substring(0, contentLength) + (content.length > contentLength ? '...' : '') 
            }}
          />
        )}
      </div>

      {videoId ? (
        <div className="w-[30%]">
          <div 
            className={cn(
              "relative rounded-lg overflow-hidden cursor-pointer group",
              imageHeight
            )}
            onClick={onVideoClick}
          >
            <img 
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
              <Play className="w-10 h-10 text-white fill-white" />
            </div>
          </div>
        </div>
      ) : hasMedia && fileUrls && (
        <div className="w-[30%]">
          <div className={cn("rounded-lg overflow-hidden", imageHeight)}>
            <MediaGallery 
              files={[fileUrls[0]]}
            />
          </div>
          {fileUrls.length > 1 && (
            <div className="mt-1 text-xs text-center text-muted-foreground">
              +{fileUrls.length - 1} weitere
            </div>
          )}
        </div>
      )}
    </div>
  );
};
