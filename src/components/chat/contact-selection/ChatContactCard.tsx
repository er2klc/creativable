
import { LeadAvatar } from "@/components/leads/detail/card/LeadAvatar";
import { PlatformIndicator } from "@/components/leads/detail/card/PlatformIndicator";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Briefcase } from "lucide-react";

interface ChatContactCardProps {
  contact: Tables<"leads">;
  onClick: () => void;
  selected?: boolean;
}

export const ChatContactCard = ({ contact, onClick, selected }: ChatContactCardProps) => {
  // Keep both username and display name
  const socialUsername = contact.social_media_username?.split('/')?.pop();
  const displayName = contact.name;

  return (
    <div
      className={cn(
        "w-[200px] flex-shrink-0 snap-start rounded-lg border cursor-pointer transition-all",
        "hover:bg-accent hover:border-accent",
        selected && "border-primary bg-primary/5",
        !selected && "border-border bg-card"
      )}
      onClick={onClick}
    >
      <div className="p-2 space-y-2">
        <div className="flex items-center gap-2">
          <LeadAvatar
            imageUrl={contact.social_media_profile_image_url}
            name={displayName}
            platform={contact.platform}
            className="h-10 w-10"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{displayName}</div>
            {socialUsername && (
              <div className="text-xs text-muted-foreground truncate">
                @{socialUsername}
              </div>
            )}
          </div>
        </div>

        {/* Kompakte Anzeige von Position/Beruf */}
        {contact.position && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            <span className="truncate">{contact.position}</span>
          </div>
        )}

        {/* Social Stats - kompakt und nur wenn vorhanden */}
        {(typeof contact.social_media_followers === 'number' || typeof contact.social_media_following === 'number') && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {typeof contact.social_media_followers === 'number' && (
              <span>{formatNumber(contact.social_media_followers)} Followers</span>
            )}
            {typeof contact.social_media_following === 'number' && (
              <>
                <span>•</span>
                <span>{formatNumber(contact.social_media_following)} Following</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for formatting numbers
const formatNumber = (num: number | null | undefined): string => {
  if (num == null) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
