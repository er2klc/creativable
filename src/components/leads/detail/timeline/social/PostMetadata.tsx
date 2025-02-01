export interface PostMetadataProps {
  location: string;
  date: string;
  tags: string[];
}

export const PostMetadata = ({ location, date, tags }: PostMetadataProps) => {
  return (
    <div className="text-sm text-gray-500 space-y-1">
      {location && <div>{location}</div>}
      {date && <div>{new Date(date).toLocaleDateString()}</div>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span key={index} className="text-blue-500">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};