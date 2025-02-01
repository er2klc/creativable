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
import { PostType } from "../../types/lead";

export interface SocialMediaPost {
  id: string;
  lead_id?: string;
  platform: string;
  type: string;
  post_type: PostType;
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
  timestamp?: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path?: string | null;
  local_media_paths?: string[] | null;
  video_url?: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
  kontaktIdFallback?: string;
}

export const SocialMediaPost = ({ post, kontaktIdFallback }: SocialMediaPostProps) => {
  const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();
  const isSidecar = postType === "sidecar" && post.media_urls && post.media_urls.length > 1;
  const hasVideo = postType === "video" && post.media_urls && post.media_urls.length > 0;
  
  console.log("🚀 Post ID:", post.id, "Lead ID:", post.lead_id || kontaktIdFallback, "Raw post:", post);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {formatDate(post.timestamp || post.posted_at || "")}
      </div>

      <div className="flex gap-4 items-start group relative">
        <div className="relative">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", 
            postType === "video" ? "bg-cyan-50 border-cyan-200" :
            postType === "image" ? "bg-purple-50 border-purple-200" :
            postType === "sidecar" ? "bg-amber-50 border-amber-200" :
            "bg-gray-50 border-gray-200"
          )}>
            {postType === "video" ? <Video className="h-5 w-5 text-cyan-500" /> :
             postType === "image" ? <Image className="h-5 w-5 text-purple-500" /> :
             postType === "sidecar" ? <MessageCircle className="h-5 w-5 text-amber-500" /> :
             <Heart className="h-5 w-5 text-gray-500" />}
          </div>
        </div>

        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" style={{ height: "100%" }} />
        <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-200" />

        <Card className={cn("flex-1 p-4 text-sm overflow-hidden",
          postType === "video" ? "bg-cyan-50 border-cyan-200" :
          postType === "image" ? "bg-purple-50 border-purple-200" :
          postType === "sidecar" ? "bg-amber-50 border-amber-200" :
          "bg-gray-50 border-gray-200"
        )}>
          <div className="flex gap-6">
            {post.media_urls && post.media_urls.length > 0 ? (
              <div className="w-1/3 min-w-[200px]">
                <MediaDisplay 
                  mediaUrls={post.media_urls} 
                  hasVideo={hasVideo} 
                  isSidecar={isSidecar} 
                />
              </div>
            ) : null}

            <div className="flex-1 min-w-0">
              <PostHeader
                timestamp={post.timestamp || post.posted_at || ""}
                type={post.type || post.post_type || ""}
                postTypeColor={postType === "video" ? "text-cyan-500" :
                             postType === "image" ? "text-purple-500" :
                             postType === "sidecar" ? "text-amber-500" :
                             "text-gray-500"}
                id={post.id}
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