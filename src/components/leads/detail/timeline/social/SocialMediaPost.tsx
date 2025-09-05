import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SocialMediaPost as SocialMediaPostType } from "@/types/leads";
import { PostHeader } from "./components/PostHeader";
import { PostContent } from "./components/PostContent";
import { PostMetadata } from "./components/PostMetadata";
import { MediaDisplay } from "./MediaDisplay";
import { PostActions } from "./components/PostActions";
import { Video, Image, MessageCircle } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings"; // ✅ Import für `settings` hinzugefügt


interface SocialMediaPostProps {
  post: SocialMediaPostType;
  kontaktIdFallback?: string;
}

const getPostTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return "bg-cyan-50 border border-cyan-300";
    case "image":
      return "bg-purple-50 border border-purple-300";
    case "sidecar":
      return "bg-amber-50 border border-amber-300";
    default:
      return "bg-gray-50 border border-gray-300";
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
      return <MessageCircle className="h-5 w-5 text-gray-500" />;
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const { settings } = useSettings(); // ✅ settings initialisieren

  if (post.id.startsWith('temp-') || post.post_type?.toLowerCase() === 'post') {
    return null;
  }

  const mediaUrls = post.media_urls || [];
  const postType = post.post_type?.toLowerCase();
  const isSidecar = postType === "sidecar" && mediaUrls.length > 1;
  const hasVideo = postType === "video" && post.video_url !== null;
  const postTypeColor = getPostTypeColor(post.media_type || post.post_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      {/* Date above the card */}
<div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
  {post.timestamp || post.posted_at ? formatDateTime(post.timestamp || post.posted_at, settings?.language) : ""}
</div>


      <div className="flex gap-4 items-start group relative">
        <div className="relative z-10">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", postTypeColor)}>
            {getPostTypeIcon(post.post_type)}
          </div>
        </div>

        <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400 z-0" />
        <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-400" />

        <Card className={cn("flex-1 p-4 text-sm overflow-hidden", postTypeColor)}>
          <div className="flex gap-6">
            <div className="w-1/3 min-w-[200px] relative">
              <MediaDisplay 
                mediaUrls={mediaUrls}
                hasVideo={hasVideo}
                isSidecar={isSidecar}
                videoUrl={post.video_url}
              />
            </div>

            <div className="flex-1 min-w-0">
              <PostHeader
                timestamp={post.timestamp || post.posted_at || ""}
                type={post.post_type}
                postTypeColor={postTypeColor}
                id={post.id}
              />

              <PostContent 
                content={post.content} 
                caption={post.caption} 
                hashtags={post.hashtags} 
              />

              <PostMetadata
                likesCount={post.likes_count}
                commentsCount={post.comments_count}
                location={post.location}
              />

              <div className="mt-4">
                <PostActions url={post.url} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
