
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { MediaGallery } from "../media-gallery/MediaGallery";

interface PostContentProps {
  title: string;
  content: string;
  contentLength: number;
  lineClamp: string;
  videoId: string | null;
  fileUrls: string[] | null;
  imageHeight: string;
  onVideoClick: (e: React.MouseEvent) => void;
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
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{title}</h3>
      
      <div className={cn(
        "flex gap-4",
        (hasMedia || videoId) && "flex-row"
      )}>
        <div className={cn(
          "flex-1 space-y-2",
          (hasMedia || videoId) && "max-w-[70%]"
        )}>
          <div 
            className={cn("prose max-w-none text-sm", lineClamp)}
            dangerouslySetInnerHTML={{ 
              __html: content?.substring(0, contentLength) + (content?.length > contentLength ? '...' : '') 
            }} 
          />
        </div>

        {videoId ? (
          <div className="w-[30%]">
            <div 
              className="relative rounded-lg overflow-hidden aspect-video cursor-pointer group"
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
        ) : hasMedia && (
          <div className="w-[30%]">
            <div className={cn("rounded-lg overflow-hidden", imageHeight)}>
              <MediaGallery files={fileUrls || []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
