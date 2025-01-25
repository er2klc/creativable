import { SocialMediaPost } from "./social/SocialMediaPost";

interface SocialMediaPostRaw {
  id: string;
  platform: string;
  type: string;
  post_type: string;
  content: string | null;
  caption: string | null;
  likesCount: number | null;
  commentsCount: number | null;
  url: string | null;
  location: string | null;
  locationName?: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  timestamp: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path: string | null;
  local_media_paths: string[] | null;
  video_url: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
}

interface SocialMediaTimelineProps {
  posts: SocialMediaPostRaw[];
}

export const SocialMediaTimeline = ({ posts }: SocialMediaTimelineProps) => {
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.posted_at || '');
    const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.posted_at || '');
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