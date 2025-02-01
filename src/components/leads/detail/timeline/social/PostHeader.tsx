import { Platform } from "@/config/platforms";

export interface PostHeaderProps {
  username: string;
  timestamp: string;
  location: string;
  platform: Platform | string;
}

export const PostHeader = ({ username, timestamp, location, platform }: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{username}</h3>
        <p className="text-sm text-gray-500">{timestamp}</p>
        {location && <p className="text-xs text-gray-400">{location}</p>}
      </div>
      <span className="text-xs text-gray-400">{platform}</span>
    </div>
  );
};
