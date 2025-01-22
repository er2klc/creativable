import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlatformIndicator } from "./PlatformIndicator";

interface LeadAvatarProps {
  imageUrl?: string | null;
  name: string;
  platform: string;
}

export const LeadAvatar = ({ imageUrl, name, platform }: LeadAvatarProps) => {
  return (
    <div className="relative">
      <Avatar className="h-20 w-20">
        <AvatarImage 
          src={imageUrl} 
          alt={name} 
        />
        <AvatarFallback>
          {name?.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <PlatformIndicator platform={platform} />
    </div>
  );
};