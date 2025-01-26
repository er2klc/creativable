import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MediaDisplay } from "./MediaDisplay";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";

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
  metadata?: {
    videoUrl?: string;
    media_urls?: string[];
  } | null;
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
}

const getPostTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return "text-#4b5563 border-cyan-500";
    case "image":
      return "text-#4b5563 border-purple-500";
    case "sidecar":
      return "text-#4b5563 border-amber-500";
    default:
      return "text-#4b5563 border-gray-500";
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const getMediaUrls = () => {
    if (post.local_media_paths && post.local_media_paths.length > 0) {
      return post.local_media_paths;
    }

    if (post.media_urls && post.media_urls.length > 0) {
      return post.media_urls;
    }

    if (post.metadata?.media_urls && post.metadata.media_urls.length > 0) {
      return post.metadata.media_urls;
    }

    const videoUrl = post.video_url || post.videoUrl || post.metadata?.videoUrl;
    if (videoUrl) {
      return [videoUrl];
    }

    return [];
  };

  const mediaUrls = getMediaUrls();
  const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();
  const isSidecar = mediaUrls.length > 1;
  const hasVideo = post.video_url !== null;
  const postTypeColor = getPostTypeColor(post.media_type || post.type || post.post_type);

  return (
    <div className="flex gap-4 items-start ml-4 relative">
      <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-gray-200" />
      <div className="absolute left-8 top-4 w-4 h-0.5 bg-gray-400" />

      <div className="flex flex-1 gap-4">
        {mediaUrls.length > 0 && (
          <div className="w-1/3 min-w-[200px]">
            <MediaDisplay 
              mediaUrls={mediaUrls} 
              hasVideo={hasVideo} 
              isSidecar={isSidecar} 
            />
          </div>
        )}

        <Card className={cn("flex-1 overflow-hidden border p-4", postTypeColor)}>
          <PostHeader 
            timestamp={post.timestamp || post.posted_at || ''} 
            type={post.type || post.post_type || ''} 
            postTypeColor={postTypeColor}
          />

          <PostContent 
            content={post.content} 
            caption={post.caption}
            hashtags={post.hashtags}
          />

          <PostMetadata 
            likesCount={post.likesCount} 
            commentsCount={post.commentsCount}
            location={post.location}
            locationName={post.locationName}
          />

          <PostActions url={post.url} />
        </Card>
      </div>
    </div>
  );
};