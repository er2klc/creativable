import type { SocialMediaPost } from "@/types/leads";
import { SocialMediaPost as SocialMediaPostComponent } from "./SocialMediaPost";

interface SocialMediaTimelineProps {
  posts: SocialMediaPost[];
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
    .sort((a, b) => {
      const dateA = a.posted_at ? new Date(a.posted_at) : new Date();
      const dateB = b.posted_at ? new Date(b.posted_at) : new Date();
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-400 z-0" />
      <div className="space-y-6">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <SocialMediaPostComponent
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