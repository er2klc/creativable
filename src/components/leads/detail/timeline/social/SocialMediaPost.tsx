import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Image, MessageCircle, Heart, MapPin, User, Link as LinkIcon, Video, ChevronLeft, ChevronRight, Grid } from "lucide-react";
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
      return <Video className={className} strokeWidth={1.5} />;
    case 'sidecar':
      return <Grid className={className} strokeWidth={1.5} />;
    default:
      return <Image className={className} strokeWidth={1.5} />;
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const getMediaUrls = () => {
  const urls: string[] = [];
  const storageUrl = import.meta.env.VITE_SUPABASE_STORAGE_URL;

  // Prüfen, ob `local_media_paths` ein JSON-Array ist
  if (post.local_media_paths && typeof post.local_media_paths === "string") {
    try {
      const parsedPaths = JSON.parse(post.local_media_paths); // Parse JSON-Array
      if (Array.isArray(parsedPaths)) {
        console.log("Using parsed local_media_paths:", parsedPaths);
        return parsedPaths; // Return parsed URLs directly
      }
    } catch (error) {
      console.error("Error parsing local_media_paths:", error);
    }
  }

  // Fallback auf `media_urls`
  if (post.media_urls && post.media_urls.length > 0) {
    console.log("Using media_urls:", post.media_urls);
    return post.media_urls;
  }

  console.log("No media paths found.");
  return urls;
};


  const mediaUrls = getMediaUrls();
  const isSidecar = post.type === "Sidecar" && mediaUrls.length > 1;
  const postTypeColor = getPostTypeColor(post.type || post.post_type);

  return (
    <div className="flex gap-4 items-start ml-4 relative">
      <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-gray-200" />
      <div className="absolute left-8 top-4 w-4 h-0.5 bg-gray-400" />

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
        {mediaUrls.length > 0 && (
          <div className="relative">
            {isSidecar ? (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0">
                      {url.includes('.mp4') ? (
                        <video
                          controls
                          className="w-full aspect-square object-cover"
                          src={url}
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {mediaUrls.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={() => emblaApi?.scrollPrev()}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={() => emblaApi?.scrollNext()}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full">
                {post.type === "Video" || post.media_type === "video" ? (
                  <video
                    controls
                    className="w-full aspect-square object-cover"
                    src={mediaUrls[0]}
                  />
                ) : (
                  <img
                    src={mediaUrls[0]}
                    alt="Post media"
                    className="w-full aspect-square object-cover"
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {post.timestamp &&
                format(new Date(post.timestamp), "PPp", { locale: de })}
            </span>
            <span className={cn("text-xs px-2 py-1 rounded-full border", postTypeColor)}>
              {post.type || post.post_type || "Post"}
            </span>
          </div>

          {(post.caption || post.content) && (
            <p className="text-sm whitespace-pre-wrap">{post.caption || post.content}</p>
          )}

          <div className="flex gap-4 text-sm text-muted-foreground">
            {typeof post.likesCount === "number" && (
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{post.likesCount.toLocaleString()}</span>
              </div>
            )}
            {typeof post.commentsCount === "number" && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentsCount.toLocaleString()}</span>
              </div>
            )}
            {(post.location || post.locationName) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{post.locationName || post.location}</span>
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

          {post.tagged_profiles && post.tagged_profiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Getaggte Profile:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tagged_profiles.map((profile, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    {profile}
                  </Badge>
                ))}
              </div>
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
