import { LeadAvatar } from "@/components/leads/detail/card/LeadAvatar";
import { LeadSocialStats } from "@/components/leads/detail/card/LeadSocialStats";
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
        "p-4 rounded-lg border cursor-pointer transition-all",
        "hover:bg-accent hover:border-accent",
        selected && "border-primary bg-primary/5",
        !selected && "border-border bg-card"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <LeadAvatar
          imageUrl={contact.social_media_profile_image_url}
          name={displayName}
          platform={contact.platform}
          className="h-10 w-10"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{displayName}</div>
          {socialUsername && (
            <div className="text-sm text-muted-foreground truncate">@{socialUsername}</div>
          )}
          {contact.position && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Briefcase className="h-3 w-3" />
              <span className="truncate">{contact.position}</span>
            </div>
          )}
        </div>
        {(contact.social_media_followers !== null || contact.social_media_following !== null) && (
          <LeadSocialStats
            followers={contact.social_media_followers}
            following={contact.social_media_following}
            engagement_rate={contact.social_media_engagement_rate}
            compact
          />
        )}
      </div>
    </div>
  );
};
