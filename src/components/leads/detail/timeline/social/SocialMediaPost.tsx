import type { SocialMediaPost as SocialMediaPostType } from "@/types/leads";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MediaDisplay } from "./MediaDisplay";
import { PostHeader } from "./components/PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { PostTypeIndicator } from "./components/PostTypeIndicator";
import { TaggedUsers } from "./components/TaggedUsers";

interface SocialMediaPostProps {
  post: SocialMediaPostType;
  kontaktIdFallback?: string;
}

const getPostTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return "bg-cyan-50 border-cyan-200";
    case "image":
    case "sidecar":
      return "bg-purple-50 border-purple-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const getMediaUrls = () => {
    const postType = post.post_type?.toLowerCase();

    if (postType === "video" && post.video_url) {
      return [post.video_url];
    }

    if ((postType === "image" || postType === "sidecar") && post.media_urls) {
      return post.media_urls;
    }

    return [];
  };

  if (post.id.startsWith('temp-') || post.post_type?.toLowerCase() === 'post') {
    return null;
  }

  const mediaUrls = getMediaUrls();
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
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {post.timestamp || post.posted_at || ""}
      </div>

      <div className="flex gap-4 items-start group relative">
        <div className="relative z-10">
          <PostTypeIndicator type={post.media_type || post.post_type} postTypeColor={postTypeColor} />
        </div>

        <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400 z-0" />
        <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-400" />

        <Card className={cn("flex-1 p-4 text-sm overflow-hidden", postTypeColor)}>
          <div className="flex gap-6">
            {mediaUrls.length > 0 ? (
              <div className="w-1/3 min-w-[200px]">
                <MediaDisplay
                  mediaUrls={mediaUrls}
                  hasVideo={hasVideo}
                  isSidecar={isSidecar}
                />
              </div>
            ) : (
              <p className="text-red-500">⚠️ Keine Medien gefunden!</p>
            )}

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
                locationName={post.location}
              />

              {post.tagged_users && <TaggedUsers users={post.tagged_users} />}

              <PostActions url={post.url} />
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};