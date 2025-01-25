import { SocialMediaPost } from "./social/SocialMediaPost";
import { SocialMediaPost as SocialMediaPostType } from "./types/socialMedia";

interface SocialMediaTimelineProps {
  posts: SocialMediaPostType[];
}

export const SocialMediaTimeline = ({ posts }: SocialMediaTimelineProps) => {
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.posted_at || '');
    const dateB = new Date(b.posted_at || '');
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="relative space-y-6">
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <SocialMediaPost key={post.id} post={post} />
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4 ml-4">
          Keine Social Media Aktivitäten vorhanden
        </div>
      )}
    </div>
  );
};