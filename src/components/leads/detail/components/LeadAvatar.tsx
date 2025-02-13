
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadAvatarProps {
  imageUrl?: string | null;
  name: string;
  platform: string;
  isVerified?: boolean;
  isPrivate?: boolean;
  className?: string;
  showPlatform?: boolean;
}

export const LeadAvatar = ({ 
  imageUrl, 
  name, 
  platform, 
  isVerified,
  isPrivate,
  className,
  showPlatform = true
}: LeadAvatarProps) => {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '';

  return (
    <div className="relative inline-block">
      <Avatar className={cn("relative", className)}>
        {imageUrl ? (
          <AvatarImage 
            src={imageUrl} 
            alt={name}
            className="object-cover"
          />
        ) : (
          <AvatarFallback className="bg-primary/10 text-xs font-semibold">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      
      {isPrivate && (
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
          <Lock className="h-3.5 w-3.5 text-gray-600" />
        </div>
      )}

      {isVerified && !isPrivate && (
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
          <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-white" />
        </div>
      )}
    </div>
  );
};
