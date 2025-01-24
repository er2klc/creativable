import { SocialMediaPost } from "./social/SocialMediaPost";

interface SocialMediaPostRaw {
  id: string;
  platform: string;
  post_type: string;
  content: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  metadata: any;
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path: string | null;
  local_media_paths: string[] | null;
  engagement_count: number | null;
  first_comment: string | null;
}

interface SocialMediaTimelineProps {
  posts: SocialMediaPostRaw[];
}

export const SocialMediaTimeline = ({ posts }: SocialMediaTimelineProps) => {
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.posted_at || '').getTime() - new Date(a.posted_at || '').getTime();
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