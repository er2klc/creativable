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
  const mediaType = post.media_type || 'image';

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4">
        <PostHeader post={post} />

        {mediaUrls.length > 0 && (
          <MediaDisplay 
            mediaUrls={mediaUrls} 
            mediaType={mediaType} 
          />
        )}

        <PostContent
          content={post.content || ''}
          caption={post.caption || ''}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />

        <PostMetadata
          location={post.location || ''}
          timestamp={post.timestamp || post.posted_at || ''}
          hashtags={post.hashtags || []}
        />

        <PostActions
          likesCount={post.likesCount || post.likes_count || 0}
          commentsCount={post.commentsCount || post.comments_count || 0}
        />
      </div>
    </Card>
  );
};