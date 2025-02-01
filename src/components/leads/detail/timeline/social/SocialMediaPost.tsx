import { Card } from "@/components/ui/card";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { MediaDisplay } from "./MediaDisplay";
import { PostActions } from "./PostActions";
import { SocialMediaPostRaw } from "../../types/lead";

interface SocialMediaPostProps {
  post: SocialMediaPostRaw;
}

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const hasMedia = (post.media_urls && post.media_urls.length > 0) || post.video_url;
  const isVideo = post.post_type === "video" || post.media_type === "video";

  return (
    <Card className="overflow-hidden">
      <PostHeader post={post} />
      
      <PostContent content={post.content || post.caption} />
      
      {hasMedia && (
        <MediaDisplay 
          mediaUrls={post.media_urls || []}
          videoUrl={post.video_url}
          isVideo={isVideo}
          localMediaPaths={post.local_media_paths}
          localVideoPath={post.local_video_path}
        />
      )}
      
      <PostMetadata post={post} />
      <PostActions post={post} />
    </Card>
  );
};