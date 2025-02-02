import { Platform } from "@/config/platforms";
import { SocialMediaPost } from "../types/lead";

interface SocialMediaTimelineProps {
  posts: SocialMediaPost[];
  platform: Platform;
  kontaktIdFallback: string;
}

export const SocialMediaTimeline = ({
  posts,
  platform,
  kontaktIdFallback
}: SocialMediaTimelineProps) => {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-gray-500">No social media posts available.</div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{post.platform}</span>
              <span className="text-sm text-gray-500">{post.posted_at}</span>
            </div>
            <p className="mt-2">{post.content}</p>
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-2">
                {post.media_urls.map((url, index) => (
                  <img key={index} src={url} alt={`Media ${index}`} className="w-full h-auto rounded" />
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center">
              <span className="text-sm">{post.likes_count} Likes</span>
              <span className="text-sm ml-4">{post.comments_count} Comments</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
