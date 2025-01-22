import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { LeadAvatar } from "./LeadAvatar";
import { PlatformIndicator } from "./PlatformIndicator";
import { LeadSocialStats } from "./LeadSocialStats";

interface LeadCardHeaderProps {
  lead: Tables<"leads">;
}

export const LeadCardHeader = ({ lead }: LeadCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between p-4">
      <div className="flex items-center gap-4">
        <LeadAvatar avatarUrl={lead.avatar_url} name={lead.name} />
        <div>
          <h3 className="font-semibold">{lead.name}</h3>
          <div className="text-sm text-muted-foreground">
            {lead.created_at && (
              <span>
                Mitglied seit {format(new Date(lead.created_at), "dd.MM.yyyy", { locale: de })}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LeadSocialStats 
          followers={lead.social_media_followers || 0}
          following={lead.social_media_following || 0}
          posts={Array.isArray(lead.social_media_posts) ? lead.social_media_posts.length : 0}
        />
        <PlatformIndicator platform={lead.platform} />
      </div>
    </div>
  );
};