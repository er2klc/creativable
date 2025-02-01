import { Heart, MessageCircle, MapPin } from "lucide-react";

interface PostMetadataProps {
  likesCount: number | null;
  commentsCount: number | null;
  location: string | null;
  locationName?: string | null;
}

export const PostMetadata = ({ 
  likesCount, 
  commentsCount, 
  location, 
  locationName 
}: PostMetadataProps) => {
  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      {typeof likesCount === "number" && (
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{likesCount.toLocaleString()}</span>
        </div>
      )}
      {typeof commentsCount === "number" && (
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount.toLocaleString()}</span>
        </div>
      )}
      {(location || locationName) && (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{locationName || location}</span>
        </div>
      )}
    </div>
  );
};