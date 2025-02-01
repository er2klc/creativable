import { SocialMediaPost } from "../../types/lead";
import { PostType } from "../../types/lead";

interface SocialMediaTimelineProps {
  posts: SocialMediaPost[];
  linkedInPosts?: any[];
  platform?: string;
  kontaktIdFallback?: string;
}

export const SocialMediaTimeline = ({ posts, linkedInPosts, platform, kontaktIdFallback }: SocialMediaTimelineProps) => {
  // Sort posts by date, including videos
  const sortedPosts = [...posts]
    .filter(post => !post.id.startsWith('temp-'))
    .sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.posted_at || '');
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.posted_at || '');
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="relative">
      {/* Linie */}
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-400 z-0" />
      {/* Posts */}
      <div className="space-y-6">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <div key={post.id} className="flex flex-col gap-4">
              {/* Post content */}
              <div className="flex-1 p-4">
                <div className="flex flex-col gap-2">
                  {/* Post header */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(post.posted_at || post.timestamp || '').toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Post content */}
                  <p className="text-sm">{post.content || post.caption}</p>
                  
                  {/* Media display */}
                  {(post.media_urls?.length > 0 || post.video_url) && (
                    <div className="mt-2">
                      {post.video_url ? (
                        <video 
                          controls 
                          className="w-full h-auto rounded-lg"
                          src={post.video_url}
                        />
                      ) : post.media_urls?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-auto rounded-lg mb-2"
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Post metadata */}
                  <div className="flex gap-4 text-sm text-gray-500 mt-2">
                    {post.likes_count !== undefined && (
                      <span>👍 {post.likes_count}</span>
                    )}
                    {post.comments_count !== undefined && (
                      <span>💬 {post.comments_count}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
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