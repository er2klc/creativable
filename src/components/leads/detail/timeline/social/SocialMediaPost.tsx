import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { MediaDisplay } from "./MediaDisplay";
import { SocialMediaPostRaw } from "../../types/lead";

interface SocialMediaPostProps {
  post: SocialMediaPostRaw;
}

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mediaUrls = post.media_urls || [];
  const hasVideo = post.video_url || post.media_type?.toLowerCase() === 'video';
  const isSidecar = post.post_type === 'Sidecar';

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4">
        <PostHeader 
          type={post.post_type} 
          postTypeColor={post.post_type === 'video' ? 'text-blue-500' : 'text-gray-500'}
          id={post.id}
        />

        {mediaUrls.length > 0 && (
          <MediaDisplay 
            mediaUrls={mediaUrls} 
            hasVideo={hasVideo}
            isSidecar={isSidecar}
          />
        )}

        <PostContent
          content={post.content || ''}
          caption={post.caption || ''}
          hashtags={post.hashtags || []}
        />

        <PostMetadata
          likesCount={post.likesCount || post.likes_count || 0}
          commentsCount={post.commentsCount || post.comments_count || 0}
          location={post.location || ''}
          locationName={post.locationName}
        />

        <PostActions url={post.url} />
      </div>
    </Card>
  );
};