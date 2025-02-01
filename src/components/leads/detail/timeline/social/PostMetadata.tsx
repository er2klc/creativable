import { MapPin } from "lucide-react";

interface PostMetadataProps {
  likesCount: number;
  commentsCount: number;
  location: string;
  locationName?: string | null;
}

export const PostMetadata = ({ likesCount, commentsCount, location, locationName }: PostMetadataProps) => {
  return (
    <div className="px-4 py-2 text-sm text-gray-500">
      <div className="flex items-center gap-4">
        <span>{likesCount} Likes</span>
        <span>{commentsCount} Comments</span>
      </div>
      {(location || locationName) && (
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="h-4 w-4" />
          <span>{locationName || location}</span>
        </div>
      )}
    </div>
  );
};