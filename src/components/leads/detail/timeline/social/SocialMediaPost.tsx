import { useState } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from "@/lib/utils";

interface SocialMediaPost {
  id: string;
  platform: string;
  type: string;
  post_type: string;
  content: string | null;
  caption: string | null;
  likesCount: number | null;
  commentsCount: number | null;
  url: string | null;
  location: string | null;
  locationName?: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  timestamp: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path: string | null;
  local_media_paths: string[] | null;
  video_url: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
}

const getPostTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return 'text-cyan-500 border-cyan-500';
    case 'image':
      return 'text-purple-500 border-purple-500';
    case 'sidecar':
      return 'text-amber-500 border-amber-500';
    default:
      return 'text-gray-500 border-gray-500';
  }
};

const getPostTypeIcon = (type: string, className: string) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return <Play className={className} strokeWidth={1.5} />;
    case 'sidecar':
      return <ArrowRight className={className} strokeWidth={1.5} />;
    default:
      return null;
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [isPlaying, setIsPlaying] = useState(false);
  const storageUrl = import.meta.env.VITE_SUPABASE_STORAGE_URL;

  const isVideo = post.local_video_path || post.video_url;
  const hasPreviewImage = post.local_media_paths && post.local_media_paths.length > 0;
  const isSidecar = !isVideo && post.local_media_paths && post.local_media_paths.length > 1;
  const isImage = !isVideo && post.local_media_paths && post.local_media_paths.length === 1;

  const getMediaUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${storageUrl}/social-media-files/${path}`;
  };

  const handleVideoClick = () => {
    setIsPlaying(true);
  };

  const renderMedia = () => {
    if (isVideo) {
      return (
        <div className="relative">
          {!isPlaying && hasPreviewImage ? (
            <div className="relative cursor-pointer" onClick={handleVideoClick}>
              <img
                src={getMediaUrl(post.local_media_paths[0])}
                alt="Video preview"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-12 w-12 text-white" />
              </div>
            </div>
          ) : (
            <video
              controls
              autoPlay={isPlaying}
              className="w-full aspect-square object-cover"
              src={post.local_video_path ? getMediaUrl(post.local_video_path) : post.video_url || undefined}
            />
          )}
        </div>
      );
    }

    if (isSidecar) {
      return (
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {post.local_media_paths.map((path, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <img
                  src={getMediaUrl(path)}
                  alt={`Media ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
              </div>
            ))}
          </div>
          {emblaApi && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                onClick={() => emblaApi.scrollPrev()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                onClick={() => emblaApi.scrollNext()}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      );
    }

    if (isImage) {
      return (
        <img
          src={getMediaUrl(post.local_media_paths[0])}
          alt="Post media"
          className="w-full aspect-square object-cover"
        />
      );
    }

    return null;
  };

  const postTypeColor = getPostTypeColor(post.type || post.post_type);

  return (
    <div className="flex gap-4 items-start ml-4 relative">
      <div className="relative z-10">
        <div className={cn(
          "h-8 w-8 rounded-full bg-white flex items-center justify-center border",
          postTypeColor
        )}>
          {getPostTypeIcon(post.type || post.post_type, "h-4 w-4")}
        </div>
      </div>

      <Card className={cn(
        "flex-1 overflow-hidden border",
        postTypeColor
      )}>
        {renderMedia()}

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {post.timestamp &&
                new Date(post.timestamp).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
            </span>
            <span className={cn("text-xs px-2 py-1 rounded-full border", postTypeColor)}>
              {post.type || post.post_type || "Post"}
            </span>
          </div>

          {(post.caption || post.content) && (
            <p className="text-sm whitespace-pre-wrap">{post.caption || post.content}</p>
          )}

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
              Zum Beitrag
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};