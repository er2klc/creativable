import { useState } from "react";
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

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <PostHeader 
        username={post.caption || ""}
        platform={post.platform || ""}
        timestamp={post.posted_at || ""}
      />

      {(post.media_urls?.length || 0) > 0 && (
        <MediaDisplay 
          urls={post.media_urls || []}
          type={post.media_type || "image"}
        />
      )}

      <PostContent 
        text={post.content || ""}
        caption={post.caption || ""}
        expanded={isExpanded}
        onToggle={handleToggleExpand}
      />

      <PostMetadata 
        location={post.location || ""}
        postedAt={post.posted_at || ""}
        tags={post.hashtags || []}
      />

      <PostActions 
        likes={post.likes_count || 0}
        comments={post.comments_count || 0}
      />
    </div>
  );
};