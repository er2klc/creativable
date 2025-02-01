import { SocialMediaPost } from "./SocialMediaPost";
import { SocialMediaPostRaw } from "../../types/lead";

interface SocialMediaTimelineProps {
  posts: SocialMediaPostRaw[];
  linkedInPosts?: any[];
  platform?: string;
}

export const SocialMediaTimeline = ({ posts, linkedInPosts, platform }: SocialMediaTimelineProps) => {
  // Filter out temp posts and sort the remaining posts
  const sortedPosts = [...posts]
    .filter(post => !post.id.startsWith('temp-')) // Filter out temp posts
    .sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.posted_at || '');
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.posted_at || '');
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="relative space-y-6">
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <SocialMediaPost 
            key={post.id} 
            post={post}
          />
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4 ml-4">
          Keine Social Media Aktivitäten vorhanden
        </div>
      )}
    </div>
  );
};