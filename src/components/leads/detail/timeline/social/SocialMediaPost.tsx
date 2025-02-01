import { useState } from "react";
import { SocialMediaPostRaw } from "../../types/lead";
import { PostHeader } from "./PostHeader";
import { MediaDisplay } from "./MediaDisplay";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";

interface SocialMediaPostProps {
  post: SocialMediaPostRaw;
  kontaktIdFallback?: string;
}

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mediaUrls = post.media_urls || [];
  const hashtags = post.hashtags || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <PostHeader 
        username={post.platform || ''} 
        profileImage={post.video_url || ''} 
        isVerified={false} 
      />

      {mediaUrls.length > 0 && (
        <MediaDisplay 
          urls={mediaUrls}
          type={post.media_type || 'image'} 
        />
      )}

      <PostContent 
        text={post.content || ''}
        caption={post.caption || ''}
        onToggle={() => setIsExpanded(!isExpanded)}
        expanded={isExpanded}
      />

      <PostMetadata 
        location={post.location || ''}
        date={post.posted_at || ''}
        tags={hashtags}
      />

      <PostActions 
        likes={post.likesCount || 0}
        comments={post.commentsCount || 0}
      />
    </div>
  );
};