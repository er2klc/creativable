import { SocialMediaPost as SocialMediaPostType } from "../../types/lead";
import { SocialMediaPost } from "./SocialMediaPost";

interface SocialMediaTimelineProps {
  posts: SocialMediaPostType[];
  linkedInPosts?: any[];
  platform?: string;
  kontaktIdFallback?: string;
}

export const SocialMediaTimeline = ({ 
  posts, 
  linkedInPosts, 
  platform, 
  kontaktIdFallback 
}: SocialMediaTimelineProps) => {
  const sortedPosts = [...posts]
    .filter(post => !post.id.startsWith('temp-'))
    .sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.posted_at || '');
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.posted_at || '');
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-400 z-0" />
      <div className="space-y-6">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <SocialMediaPost
              key={post.id}
              post={post}
              kontaktIdFallback={kontaktIdFallback}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4 ml-4">
            Keine Social Media Aktivitäten vorhanden
          </div>
        )}
      </div>
    </div>
  );
};