import { cn } from "@/lib/utils";

interface LeadAvatarProps {
  name: string;
  platform: string;
  imageUrl?: string | null;
}

export const LeadAvatar = ({ name, platform, imageUrl }: LeadAvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-shrink-0">
      <div className={cn(
        "h-16 w-16 rounded-md overflow-hidden",
        platform.toLowerCase() === "offline" && "border border-gray-300"
      )}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-lg font-medium">
            {getInitials(name)}
          </div>
        )}
      </div>
    </div>
  );
};