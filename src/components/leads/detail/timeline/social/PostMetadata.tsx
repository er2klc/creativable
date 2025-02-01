import { Badge } from "@/components/ui/badge";

export interface PostMetadataProps {
  location: string;
  postedAt: string;
  tags: string[];
}

export const PostMetadata = ({ location, postedAt, tags }: PostMetadataProps) => {
  return (
    <div className="flex flex-col">
      {location && (
        <div className="text-sm text-gray-500">
          <strong>Location:</strong> {location}
        </div>
      )}
      {postedAt && (
        <div className="text-sm text-gray-500">
          <strong>Posted At:</strong> {postedAt}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
