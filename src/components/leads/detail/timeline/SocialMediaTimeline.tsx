import { Image, Video, Presentation } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SocialMediaTimelineProps {
  posts: Tables<"social_media_posts">[];
}

const PostTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "video":
      return <Video className="h-5 w-5 text-blue-500" />;
    case "slideshow":
      return <Presentation className="h-5 w-5 text-purple-500" />;
    default:
      return <Image className="h-5 w-5 text-green-500" />;
  }
};

export const SocialMediaTimeline = ({ posts }: SocialMediaTimelineProps) => {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="bg-white rounded-lg shadow p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PostTypeIcon type={post.post_type} />
              <span className="text-sm font-medium">
                {post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
              </span>
            </div>
            {post.posted_at && (
              <span className="text-sm text-gray-500">
                {format(new Date(post.posted_at), "dd.MM.yyyy HH:mm", { locale: de })}
              </span>
            )}
          </div>

          {post.content && (
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {post.likes_count > 0 && (
              <span>❤️ {post.likes_count} Likes</span>
            )}
            {post.comments_count > 0 && (
              <span>💬 {post.comments_count} Kommentare</span>
            )}
          </div>

          {(post.location || post.mentioned_profiles?.length > 0 || post.tagged_profiles?.length > 0) && (
            <div className="border-t pt-3 mt-3 space-y-2 text-sm text-gray-600">
              {post.location && (
                <div>📍 {post.location}</div>
              )}
              {post.mentioned_profiles && post.mentioned_profiles.length > 0 && (
                <div>@ Erwähnt: {post.mentioned_profiles.join(", ")}</div>
              )}
              {post.tagged_profiles && post.tagged_profiles.length > 0 && (
                <div>🏷️ Markiert: {post.tagged_profiles.join(", ")}</div>
              )}
            </div>
          )}
        </div>
      ))}

      {posts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Keine Social Media Aktivitäten vorhanden
        </div>
      )}
    </div>
  );
};