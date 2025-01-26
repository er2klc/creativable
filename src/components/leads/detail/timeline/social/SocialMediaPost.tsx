import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MediaDisplay } from "./MediaDisplay";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { motion } from "framer-motion";
import { formatDate } from "../TimelineUtils";
import { Image, Video, MessageCircle, Heart } from "lucide-react";

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
      return "bg-cyan-50 border-cyan-200";
    case "image":
      return "bg-purple-50 border-purple-200";
    case "sidecar":
      return "bg-amber-50 border-amber-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getPostTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return <Video className="h-5 w-5 text-cyan-500" />;
    case "image":
      return <Image className="h-5 w-5 text-purple-500" />;
    case "sidecar":
      return <MessageCircle className="h-5 w-5 text-amber-500" />;
    default:
      return <Heart className="h-5 w-5 text-gray-500" />;
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      {/* Date above the card */}
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {formatDate(post.timestamp || post.posted_at || '')}
      </div>
      
      <div className="flex gap-4 items-start group relative">
        {/* Circle with Icon */}
        <div className="relative">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            postTypeColor.replace('bg-', 'bg-').replace('border-', 'border-')
          )}>
            {getPostTypeIcon(post.media_type || post.type || post.post_type)}
          </div>
        </div>
        
        {/* Connecting Line to Card */}
        <div className="absolute left-8 top-4 w-4 h-0.5 bg-gray-200" />
        
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

          <Card className={cn("flex-1 p-4 text-sm", postTypeColor)}>
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
    </motion.div>
  );
};