import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlatformIndicator } from "./PlatformIndicator";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/supabase-utils";

interface LeadAvatarProps {
  imageUrl?: string | null;
  name: string;
  platform: string;
  isVerified?: boolean;
  className?: string;
  showPlatform?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LeadAvatar = ({ 
  imageUrl, 
  name, 
  platform, 
  isVerified, 
  className,
  showPlatform = true,
  avatarSize = 'md'
}: LeadAvatarProps) => {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '';

  const sizeClasses = {
    'sm': 'h-8 w-8',
    'md': 'h-10 w-10',
    'lg': 'h-16 w-16',
    'xl': 'h-24 w-24'
  };

  const getPlatformSize = (avatarSize: string): 'xs' | 'sm' | 'md' => {
    switch (avatarSize) {
      case 'xl':
        return 'md';
      case 'lg':
        return 'sm';
      default:
        return 'xs';
    }
  };

  return (
    <div className="relative inline-flex">
      <Avatar className={cn(
        "relative", 
        sizeClasses[avatarSize], 
        className
      )}>
        <AvatarImage 
          src={getAvatarUrl(imageUrl)}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showPlatform && (
        <PlatformIndicator 
          platform={platform} 
          size={getPlatformSize(avatarSize)} 
        />
      )}

      {isVerified && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            fill="blue-500"
            className="w-3 h-3"
          >
            <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};
