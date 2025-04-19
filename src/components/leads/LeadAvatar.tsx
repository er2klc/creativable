
import { getInitials, getPlatformColor } from "@/lib/utils";

interface LeadAvatarProps {
  name: string;
  platform: string;
  imageUrl?: string | null;
}

export const LeadAvatar = ({ name, platform, imageUrl }: LeadAvatarProps) => {
  return (
    <div className="flex-shrink-0">
      <div className={`h-10 w-10 rounded-full overflow-hidden ${
        platform.toLowerCase() === "offline" && "border border-gray-300"
      }`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-sm font-medium">
            {getInitials(name)}
          </div>
        )}
      </div>
    </div>
  );
};
