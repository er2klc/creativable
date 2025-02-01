export interface PostHeaderProps {
  username: string;
  timestamp: string;
  location?: string;
  platform: string;
}

export const PostHeader = ({ username, timestamp, location, platform }: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="font-semibold">{username}</span>
        {location && <span className="text-gray-500">• {location}</span>}
      </div>
      <div className="text-sm text-gray-500">
        {new Date(timestamp).toLocaleDateString()}
      </div>
    </div>
  );
};