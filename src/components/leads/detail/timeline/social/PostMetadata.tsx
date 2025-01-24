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
  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      {typeof post.likes_count === 'number' && (
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{post.likes_count.toLocaleString()}</span>
        </div>
      )}
      
      {typeof post.comments_count === 'number' && (
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments_count.toLocaleString()}</span>
        </div>
      )}

      {post.location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{post.location}</span>
        </div>
      )}

      {post.mentioned_profiles && post.mentioned_profiles.length > 0 && (
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>{post.mentioned_profiles.length} Erwähnungen</span>
        </div>
      )}
    </div>
  );
};