import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  Video,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SocialMediaPost {
  id: string;
  platform: string;
  post_type: string;
  content: string | null;
  caption: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  posted_at: string | null;
  local_media_paths: string[] | null;
  video_url: string | null;
  hashtags: string[] | null;
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
}

const getPostTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return "text-#4b5563 border-cyan-500";
    case "sidecar":
      return "text-#4b5563 border-purple-500";
    case "image":
      return "text-#4b5563 border-amber-500";
    default:
      return "text-#4b5563 border-gray-500";
  }
};

const getPostTypeIcon = (type: string, className: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return <Video className={className} strokeWidth={1.5} />;
    case "sidecar":
      return <Image className={className} strokeWidth={1.5} />;
    default:
      return <Image className={className} strokeWidth={1.5} />;
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  console.log("Processing post:", {
    id: post.id,
    local_media_paths: post.local_media_paths,
    video_url: post.video_url,
    post_type: post.post_type
  });

  const getMediaContent = () => {
    if (post.video_url) {
      console.log("Using video_url for post", post.id);
      return (
        <video
          controls
          className="w-full aspect-square object-cover"
          src={post.video_url}
        />
      );
    }

    if (post.local_media_paths && post.local_media_paths.length > 0) {
      console.log("Using local_media_paths for post", post.id, post.local_media_paths);
      
      if (post.local_media_paths.length === 1) {
        return (
          <img
            src={post.local_media_paths[0]}
            alt="Post media"
            className="w-full aspect-square object-cover"
          />
        );
      }

      return (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {post.local_media_paths.map((url, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
              </div>
            ))}
          </div>
          {post.local_media_paths.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  const mediaContent = getMediaContent();
  const postType = post.video_url ? 'video' : 
                  (post.local_media_paths?.length || 0) > 1 ? 'sidecar' : 'image';
  const postTypeColor = getPostTypeColor(postType);

  return (
    <div className="flex gap-4 items-start ml-4 relative">
      <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-gray-200" />
      <div className="absolute left-8 top-4 w-4 h-0.5 bg-gray-400" />

      <div className="relative z-10">
        <div className={cn("h-8 w-8 rounded-full bg-white flex items-center justify-center border", postTypeColor)}>
          {getPostTypeIcon(postType, "h-4 w-4")}
        </div>
      </div>

      <Card className={cn("flex-1 overflow-hidden border", postTypeColor)}>
        {mediaContent && (
          <div className="relative">
            {mediaContent}
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {post.posted_at &&
                format(new Date(post.posted_at), "PPp", { locale: de })}
            </span>
            <span className={cn("text-xs px-2 py-1 rounded-full border", postTypeColor)}>
              {postType}
            </span>
          </div>

          {post.caption && (
            <p className="text-sm whitespace-pre-wrap">
              {post.caption}
            </p>
          )}

          <div className="flex gap-4 text-sm text-muted-foreground">
            {typeof post.likes_count === "number" && (
              <div className="flex items-center gap-1">
                <span>{post.likes_count.toLocaleString()} Likes</span>
              </div>
            )}
            {typeof post.comments_count === "number" && (
              <div className="flex items-center gap-1">
                <span>{post.comments_count.toLocaleString()} Kommentare</span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center gap-1">
                <span>{post.location}</span>
              </div>
            )}
          </div>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {post.url && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(post.url, "_blank")}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Zum Beitrag
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};