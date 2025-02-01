import { Card, CardContent } from "@/components/ui/card";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { MediaDisplay } from "./MediaDisplay";
import { SocialMediaPostRaw } from "../../types/lead";

interface SocialMediaPostProps {
  post: SocialMediaPostRaw;
  kontaktIdFallback?: string;
}

export const SocialMediaPost = ({ post, kontaktIdFallback }: SocialMediaPostProps) => {
  const hasMedia = (post.media_urls && post.media_urls.length > 0) || post.video_url;
  const showMediaDisplay = hasMedia || post.local_media_paths?.length || post.local_video_path;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <PostHeader 
          username={post.caption || post.content || ''} 
          timestamp={post.posted_at || post.timestamp || ''} 
          location={post.location || ''}
          platform={post.platform}
        />
        
        <PostContent 
          content={post.content || ''} 
          caption={post.caption || ''}
        />

        {showMediaDisplay && (
          <MediaDisplay
            mediaUrls={post.media_urls || []}
            videoUrl={post.video_url || post.videoUrl}
            localMediaPaths={post.local_media_paths}
            localVideoPath={post.local_video_path}
            mediaType={post.media_type}
            postType={post.post_type}
            kontaktIdFallback={kontaktIdFallback}
          />
        )}

        <PostMetadata 
          likesCount={post.likesCount || post.likes_count || 0}
          commentsCount={post.commentsCount || post.comments_count || 0}
          timestamp={post.posted_at || post.timestamp || ''}
          platform={post.platform}
        />
        
        <PostActions 
          likesCount={post.likesCount || post.likes_count || 0}
          commentsCount={post.commentsCount || post.comments_count || 0}
          platform={post.platform}
        />
      </CardContent>
    </Card>
  );
};