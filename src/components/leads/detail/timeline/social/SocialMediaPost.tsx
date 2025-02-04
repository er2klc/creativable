import { SocialMediaPost as SocialMediaPostType } from "@/types/leads";
import { PostHeader } from "./components/PostHeader";
import { PostContent } from "./components/PostContent";
import { PostActions } from "./components/PostActions";
import { MediaDisplay } from "./components/MediaDisplay";
import { PostMetadata } from "./components/PostMetadata";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface SocialMediaPostProps {
  post: SocialMediaPostType;
  kontaktIdFallback?: string;
}

export const SocialMediaPost = ({ post, kontaktIdFallback }: SocialMediaPostProps) => {
  const { settings } = useSettings();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <PostHeader 
        platform={post.platform}
        postedAt={formatDateTime(post.posted_at || post.created_at, settings?.language)}
        location={post.location}
      />
      
      <PostContent 
        content={post.content || post.caption}
        firstComment={post.first_comment}
      />
      
      {(post.media_urls?.length > 0 || post.video_url) && (
        <MediaDisplay
          mediaUrls={post.media_urls}
          videoUrl={post.video_url}
          mediaType={post.media_type}
          localMediaPaths={post.local_media_paths}
          kontaktId={post.lead_id || kontaktIdFallback}
        />
      )}
      
      <PostMetadata
        likesCount={post.likes_count}
        commentsCount={post.comments_count}
        engagementCount={post.engagement_count}
      />
      
      <PostActions
        url={post.url}
        platform={post.platform}
      />
    </div>
  );
};