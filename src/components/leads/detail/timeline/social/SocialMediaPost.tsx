import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SocialMediaPostRaw } from "../../types/lead";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { MediaDisplay } from "./MediaDisplay";

interface SocialMediaPostProps {
  post: SocialMediaPostRaw;
  kontaktIdFallback?: string;
}

export const SocialMediaPost = ({ post, kontaktIdFallback }: SocialMediaPostProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMediaUrls = () => {
    const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();
    
    if (postType === "video" && post.video_url) {
      return [post.video_url];
    }
    
    if (Array.isArray(post.media_urls) && post.media_urls.length > 0) {
      return post.media_urls;
    }
    
    if (Array.isArray(post.local_media_paths) && post.local_media_paths.length > 0) {
      return post.local_media_paths;
    }
    
    return [];
  };

  const mediaUrls = getMediaUrls();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <div className="p-4 space-y-4">
          <PostHeader post={post} />
          
          {mediaUrls.length > 0 && (
            <MediaDisplay 
              mediaUrls={mediaUrls} 
              mediaType={post.media_type || post.post_type} 
            />
          )}

          <PostContent 
            content={post.content} 
            caption={post.caption}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />

          <PostMetadata
            location={post.location}
            timestamp={post.posted_at || post.timestamp}
            hashtags={post.hashtags}
          />

          <PostActions
            likesCount={post.likesCount || post.likes_count || 0}
            commentsCount={post.commentsCount || post.comments_count || 0}
          />
        </div>
      </Card>
    </motion.div>
  );
};