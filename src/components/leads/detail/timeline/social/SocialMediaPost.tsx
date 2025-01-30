import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDate } from "../TimelineUtils";
import { Image, Video, MessageCircle, Heart } from "lucide-react";
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
    displayUrl?: string;
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
  // Get all possible media URLs
  const getMediaUrls = () => {
    // First check for direct media_urls
    if (post.media_urls && post.media_urls.length > 0) {
      return post.media_urls;
    }

    // Then check for local paths
    if (post.local_media_paths && post.local_media_paths.length > 0) {
      return post.local_media_paths;
    }

    // Check for video URLs
    const videoUrl = post.video_url || post.videoUrl || post.metadata?.videoUrl;
    if (videoUrl) {
      return [videoUrl];
    }

    // Check for displayUrl for Image type
    if ((post.type === 'Image' || post.post_type === 'Image') && post.metadata?.displayUrl) {
      console.log('Using displayUrl for Image type:', post.metadata.displayUrl);
      return [post.metadata.displayUrl];
    }

    // Check for images array
    if (post.images && post.images.length > 0) {
      return post.images;
    }

    // If no other media found, return empty array
    return [];
  };

  const mediaUrls = getMediaUrls();
  const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();
  const isSidecar = mediaUrls.length > 1;
  const hasVideo = post.video_url !== null || post.videoUrl !== null || post.metadata?.videoUrl !== null;
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
        
        {/* Vertical Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" style={{ height: '100%' }} />
        
        {/* Connecting Line to Card */}
        <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-200" />
        
        <Card className={cn("flex-1 p-4 text-sm overflow-hidden", postTypeColor)}>
          <div className="flex gap-4">
            {mediaUrls.length > 0 && (
              <div className="w-1/3 min-w-[200px]">
                <MediaDisplay 
                  mediaUrls={mediaUrls} 
                  hasVideo={hasVideo} 
                  isSidecar={isSidecar} 
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
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
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};