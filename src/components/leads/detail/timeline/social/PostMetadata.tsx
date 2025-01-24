import { MessageCircle, Heart, MapPin, User } from "lucide-react";

interface PostMetadataProps {
  post: {
    likes_count: number | null;
    comments_count: number | null;
    location: string | null;
    mentioned_profiles: string[] | null;
  };
}

export const PostMetadata = ({ post }: PostMetadataProps) => {
  console.log('Post-Daten:', post); // Debugging

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      {/* Likes */}
      {post.likesCount != null && (
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{post.likesCount.toLocaleString()}</span>
        </div>
      )}

      {/* Kommentare */}
      {post.commentsCount != null && (
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{post.commentsCount.toLocaleString()}</span>
        </div>
      )}

      {/* Location */}
      {post.location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{post.location}</span>
        </div>
      )}

      {/* Erwähnte Profile */}
      {post.mentioned_profiles?.length > 0 && (
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>{post.mentioned_profiles.length} Erwähnungen</span>
        </div>
      )}
    </div>
  );
};
