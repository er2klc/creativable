interface PostMetadataProps {
  location: string;
  postedAt: string;
  tags: string[];
}

export const PostMetadata = ({ location, postedAt, tags }: PostMetadataProps) => {
  return (
    <div className="text-sm text-gray-500 space-y-1">
      {location && (
        <div>
          <span className="font-medium">Location: </span>
          {location}
        </div>
      )}
      {postedAt && (
        <div>
          <span className="font-medium">Posted: </span>
          {new Date(postedAt).toLocaleDateString()}
        </div>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span key={index} className="text-blue-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};